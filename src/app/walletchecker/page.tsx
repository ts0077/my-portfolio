'use client'

import { useState, useEffect, useRef } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'viem/chains'
interface PhaseInfo {
  phase: string
  eligible: boolean
  maxMint: number
  price: string
  minted: number
  remaining: number
  reason?: string
  active: boolean
}

interface Wallet {
  id: number
  address: `0x${string}`
  label: string
  eligibility: PhaseInfo | null
  phases: PhaseInfo[]
  lastChecked: string
}

const CONTRACT_ABI = [
  {
    inputs: [{ name: 'minter', type: 'address' }],
    name: 'getMintStats',
    outputs: [
      { name: 'minterNumMinted', type: 'uint256' },
      { name: 'currentTotalSupply', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // Add this alternative for older SeaDrop contracts
  {
    inputs: [
      { name: 'minter', type: 'address' },
      { name: 'feeRecipient', type: 'address' }
    ],
    name: 'getMintStats',
    outputs: [
      { name: 'minterNumMinted', type: 'uint256' },
      { name: 'currentTotalSupply', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'maxSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllowedSeaDrop',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const SEADROP_ABI = [
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'getPublicDrop',
    outputs: [
      { name: 'mintPrice', type: 'uint80' },
      { name: 'startTime', type: 'uint48' },
      { name: 'endTime', type: 'uint48' },
      { name: 'maxTotalMintableByWallet', type: 'uint16' },
      { name: 'feeBps', type: 'uint16' },
      { name: 'restrictFeeRecipients', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'getAllowListMerkleRoot',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'minter', type: 'address' }
    ],
    name: 'getAllowListMintStats',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'getTokenGatedDrop',
    outputs: [
      { name: 'mintPrice', type: 'uint80' },
      { name: 'startTime', type: 'uint48' },
      { name: 'endTime', type: 'uint48' },
      { name: 'maxTotalMintableByWallet', type: 'uint16' },
      { name: 'minFeeBps', type: 'uint16' },
      { name: 'maxFeeBps', type: 'uint16' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'minter', type: 'address' }
    ],
    name: 'getTokenGatedMintStats',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'nftContract', type: 'address' }],
    name: 'getFreeDrop',
    outputs: [
      { name: 'startTime', type: 'uint48' },
      { name: 'endTime', type: 'uint48' },
      { name: 'maxTotalMintableByWallet', type: 'uint16' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export default function SeaDropChecker() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [contractAddress, setContractAddress] = useState('')
  const [chainId, setChainId] = useState(1)
  const [seaDropImpl, setSeaDropImpl] = useState('0x00005EA00Ac477B1030CE78506496e8C2dE24bf5')
  const [newWallet, setNewWallet] = useState({ address: '', label: '' })
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')
  const [contractInfo, setContractInfo] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [allowlistData, setAllowlistData] = useState<Record<string, { maxMint: number, price: string }>>({})
  const seaDropRef = useRef<string>(seaDropImpl)

  const chains: Record<number, any> = {
    1: mainnet, 11155111: sepolia, 137: polygon,
    42161: arbitrum, 10: optimism, 8453: base
  }

  useEffect(() => {
    const saved = localStorage.getItem('seadrop_wallets')
    const savedAddr = localStorage.getItem('seadrop_contract')
    const savedAllowlist = localStorage.getItem('seadrop_allowlist')
    if (saved) setWallets(JSON.parse(saved))
    if (savedAddr) setContractAddress(savedAddr)
    if (savedAllowlist) setAllowlistData(JSON.parse(savedAllowlist))
  }, [])

  useEffect(() => {
    localStorage.setItem('seadrop_wallets', JSON.stringify(wallets))
    localStorage.setItem('seadrop_contract', contractAddress)
    localStorage.setItem('seadrop_allowlist', JSON.stringify(allowlistData))
  }, [wallets, contractAddress, allowlistData])

  const addDebug = (msg: string) => setDebugInfo(prev => [...prev.slice(-19), msg])

  const getClient = () => {
    const chain = chains[chainId] || mainnet
    const rpcUrls: Record<number, string> = {
      1: 'https://eth-mainnet.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f',
      11155111: 'https://eth-sepolia.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f',
      137: 'https://polygon-mainnet.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f',
      42161: 'https://arb-mainnet.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f',
      10: 'https://opt-mainnet.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f',
      8453: 'https://base-mainnet.g.alchemy.com/v2/nxVNHk8ObxgYn9sPplh9f'
    }
    return createPublicClient({
      chain,
      transport: http(rpcUrls[chainId] || rpcUrls[1])
    })
  }

  const fetchContractInfo = async () => {
    if (!contractAddress || contractAddress.length < 10) {
      setError('Please enter a valid contract address')
      return
    }

    setError('')
    setDebugInfo([])
    addDebug('Loading contract info...')

    try {
      const client = getClient()
      const addr = contractAddress as `0x${string}`

      let name = 'Unknown'
      let maxSupply = BigInt(0)
      let totalSupply = BigInt(0)

      try {
        name = await client.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'name' }) as string
        addDebug('✅ Name: ' + name)
      } catch (e: any) {
        addDebug('❌ name() failed: ' + e.message)
      }

      try {
        maxSupply = await client.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'maxSupply' }) as bigint
        addDebug('✅ MaxSupply: ' + maxSupply.toString())
      } catch (e: any) {
        addDebug('❌ maxSupply() failed: ' + e.message)
      }

      try {
        totalSupply = await client.readContract({ address: addr, abi: CONTRACT_ABI, functionName: 'totalSupply' }) as bigint
        addDebug('✅ TotalSupply: ' + totalSupply.toString())
      } catch (e: any) {
        addDebug('❌ totalSupply() failed: ' + e.message)
      }

      // Detect proxy type
      try {
        const code = await client.getBytecode({ address: addr })
        const size = (code?.length || 0) / 2 // hex chars to bytes
        addDebug('ℹ️ Contract bytecode size: ' + size + ' bytes')

        if (size < 100) {
          addDebug('ℹ️ Minimal proxy detected (EIP-1167) — calls delegate to implementation')
        }
      } catch (e: any) {
        addDebug('Could not read contract bytecode')
      }

      // Try to get allowed SeaDrop — but it's optional
      let seaDropAddress = seaDropImpl
      try {
        const allowed = await client.readContract({
          address: addr,
          abi: CONTRACT_ABI,
          functionName: 'getAllowedSeaDrop'
        }) as string[]

        if (allowed && allowed.length > 0) {
          seaDropAddress = allowed[0]
          setSeaDropImpl(seaDropAddress)
          seaDropRef.current = seaDropAddress
          addDebug('✅ Found SeaDrop: ' + seaDropAddress.slice(0, 20) + '...')
        } else {
          addDebug('ℹ️ No custom SeaDrop configured, using default')
        }
      } catch (e: any) {
        // This is EXPECTED for proxies without getAllowedSeaDrop
        addDebug('ℹ️ getAllowedSeaDrop not available on this contract')
        addDebug('ℹ️ Using default SeaDrop: ' + seaDropImpl.slice(0, 20) + '...')
      }

      let publicDrop = null
      try {
        const drop = await client.readContract({
          address: seaDropAddress as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getPublicDrop',
          args: [addr]
        }) as [bigint, bigint, bigint, number, number, boolean]

        publicDrop = {
          price: (Number(drop[0]) / 1e18).toString() + ' ETH',
          maxPerWallet: drop[3],
          startTime: Number(drop[1]),
          endTime: Number(drop[2]),
          active: Date.now() / 1000 > Number(drop[1]) && Date.now() / 1000 < Number(drop[2])
        }
        addDebug('✅ Public drop loaded')
      } catch (e: any) {
        addDebug('❌ getPublicDrop failed: ' + e.message)
      }

      let allowlistRoot = null
      try {
        const root = await client.readContract({
          address: seaDropAddress as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getAllowListMerkleRoot',
          args: [addr]
        }) as string
        if (root && root !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          allowlistRoot = root
          addDebug('✅ Allowlist detected')
        }
      } catch (e: any) {
        addDebug('ℹ️ No allowlist configured')
      }

      let tokenGatedDrop = null
      try {
        const drop = await client.readContract({
          address: seaDropAddress as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getTokenGatedDrop',
          args: [addr]
        }) as [bigint, bigint, bigint, number, number, number]

        if (Number(drop[0]) > 0 || Number(drop[3]) > 0) {
          tokenGatedDrop = {
            price: (Number(drop[0]) / 1e18).toString() + ' ETH',
            maxPerWallet: drop[3],
            startTime: Number(drop[1]),
            endTime: Number(drop[2]),
            active: Date.now() / 1000 > Number(drop[1]) && Date.now() / 1000 < Number(drop[2])
          }
          addDebug('✅ Token gated drop loaded')
        }
      } catch (e: any) {
        addDebug('ℹ️ No token-gated drop configured')
      }

      let freeDrop = null
      try {
        const drop = await client.readContract({
          address: seaDropAddress as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getFreeDrop',
          args: [addr]
        }) as [bigint, bigint, number]

        if (Number(drop[2]) > 0) {
          freeDrop = {
            maxPerWallet: drop[2],
            startTime: Number(drop[0]),
            endTime: Number(drop[1]),
            active: Date.now() / 1000 > Number(drop[0]) && Date.now() / 1000 < Number(drop[1])
          }
          addDebug('✅ Free drop loaded')
        }
      } catch (e: any) {
        addDebug('ℹ️ No free drop configured')
      }

      setContractInfo({
        name,
        maxSupply: Number(maxSupply),
        totalSupply: Number(totalSupply),
        publicDrop,
        allowlistRoot,
        tokenGatedDrop,
        freeDrop
      })

      if (name === 'Unknown' && Number(maxSupply) === 0) {
        setError('Could not read contract. Make sure the address and chain are correct.')
      }

    } catch (err: any) {
      setError('Error: ' + err.message)
      addDebug('Fatal: ' + err.message)
    }
  }

  const addWallet = () => {
    if (!newWallet.address.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid address')
      return
    }
    setWallets(prev => [...prev, {
      id: Date.now(),
      address: newWallet.address.toLowerCase() as `0x${string}`,
      label: newWallet.label || 'Wallet ' + (prev.length + 1),
      eligibility: null,
      phases: [],
      lastChecked: ''
    }])
    setNewWallet({ address: '', label: '' })
  }

  const removeWallet = (id: number) => setWallets(prev => prev.filter(w => w.id !== id))

  const checkEligibility = async () => {
    if (!contractAddress) return setError('Enter contract address')
    setIsChecking(true)
    setError('')
    setDebugInfo([])
    addDebug('Checking all phases...')

    try {
      const client = getClient()
      const addr = contractAddress as `0x${string}`
      const now = Math.floor(Date.now() / 1000)

      // Fetch all drop phases
      let publicDrop: any = null
      let allowlistRoot: string | null = null
      let tokenGatedDrop: any = null
      let freeDrop: any = null

      try {
        const drop = await client.readContract({
          address: seaDropRef.current as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getPublicDrop',
          args: [addr]
        }) as [bigint, bigint, bigint, number, number, boolean]
        publicDrop = {
          mintPrice: drop[0],
          startTime: Number(drop[1]),
          endTime: Number(drop[2]),
          maxPerWallet: drop[3]
        }
      } catch (e: any) { addDebug('Public drop: none') }

      try {
        const root = await client.readContract({
          address: seaDropRef.current as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getAllowListMerkleRoot',
          args: [addr]
        }) as string
        if (root && root !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          allowlistRoot = root
        }
      } catch (e: any) { addDebug('Allowlist: none') }

      try {
        const drop = await client.readContract({
          address: seaDropRef.current as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getTokenGatedDrop',
          args: [addr]
        }) as [bigint, bigint, bigint, number, number, number]
        if (Number(drop[0]) > 0 || Number(drop[3]) > 0) {
          tokenGatedDrop = {
            mintPrice: drop[0],
            startTime: Number(drop[1]),
            endTime: Number(drop[2]),
            maxPerWallet: drop[3]
          }
        }
      } catch (e: any) { addDebug('Token gated: none') }

      try {
        const drop = await client.readContract({
          address: seaDropRef.current as `0x${string}`,
          abi: SEADROP_ABI,
          functionName: 'getFreeDrop',
          args: [addr]
        }) as [bigint, bigint, number]
        if (Number(drop[2]) > 0) {
          freeDrop = {
            startTime: Number(drop[0]),
            endTime: Number(drop[1]),
            maxPerWallet: drop[2]
          }
        }
      } catch (e: any) { addDebug('Free drop: none') }

      const updated = await Promise.all(wallets.map(async (wallet) => {
        const phases: PhaseInfo[] = []
        let bestEligibility: PhaseInfo | null = null

        try {
          addDebug('Checking ' + wallet.address.slice(0, 10) + '...')

          // Get total minted by this wallet
          let totalMinted = 0
          try {
            const stats = await client.readContract({
              address: addr,
              abi: CONTRACT_ABI,
              functionName: 'getMintStats',
              args: [wallet.address]
            }) as [bigint, bigint, bigint]
            totalMinted = Number(stats[0])
            addDebug('  Total minted: ' + totalMinted)
          } catch (e: any) {
            addDebug('  getMintStats failed: ' + e.message)
            try {
              const bal = await client.readContract({
                address: addr,
                abi: CONTRACT_ABI,
                functionName: 'balanceOf',
                args: [wallet.address]
              }) as bigint
              totalMinted = Number(bal)
              addDebug('  Balance: ' + totalMinted)
            } catch { }
          }

          // Check sold out
          let isSoldOut = false
          try {
            const total = await client.readContract({
              address: addr,
              abi: CONTRACT_ABI,
              functionName: 'totalSupply'
            }) as bigint
            const max = await client.readContract({
              address: addr,
              abi: CONTRACT_ABI,
              functionName: 'maxSupply'
            }) as bigint
            if (Number(total) >= Number(max) && Number(max) > 0) {
              isSoldOut = true
            }
          } catch { }

          // PHASE 1: Allowlist (Vault)
          if (allowlistRoot) {
            try {
              const allowlistMinted = await client.readContract({
                address: seaDropRef.current as `0x${string}`,
                abi: SEADROP_ABI,
                functionName: 'getAllowListMintStats',
                args: [addr, wallet.address]
              }) as bigint

              const allowlistMintedNum = Number(allowlistMinted)
              const storedAllowlist = allowlistData[wallet.address.toLowerCase()]
              const maxMint = storedAllowlist ? storedAllowlist.maxMint : allowlistMintedNum
              const remaining = Math.max(0, maxMint - allowlistMintedNum)
              const eligible = remaining > 0 && !isSoldOut

              const phase: PhaseInfo = {
                phase: 'Vault',
                eligible,
                maxMint,
                price: storedAllowlist ? storedAllowlist.price : 'Unknown',
                minted: allowlistMintedNum,
                remaining,
                active: true,
                reason: isSoldOut ? 'Sold out' : !eligible ? 'Vault limit reached' : ''
              }
              phases.push(phase)
              if (eligible && !bestEligibility) bestEligibility = phase
              addDebug('  ' + (eligible ? '✅' : '❌') + ' Vault: ' + remaining + ' remaining')
            } catch (e: any) {
              addDebug('  Vault check failed: ' + e.message)
            }
          }

          // PHASE 2: Token Gated (GTD)
          if (tokenGatedDrop) {
            const active = now > tokenGatedDrop.startTime && now < tokenGatedDrop.endTime
            try {
              const tgMinted = await client.readContract({
                address: seaDropRef.current as `0x${string}`,
                abi: SEADROP_ABI,
                functionName: 'getTokenGatedMintStats',
                args: [addr, wallet.address]
              }) as bigint

              const tgMintedNum = Number(tgMinted)
              const remaining = Math.max(0, tokenGatedDrop.maxPerWallet - tgMintedNum)
              const eligible = remaining > 0 && active && !isSoldOut

              const phase: PhaseInfo = {
                phase: 'GTD',
                eligible,
                maxMint: tokenGatedDrop.maxPerWallet,
                price: (Number(tokenGatedDrop.mintPrice) / 1e18).toString() + ' ETH',
                minted: tgMintedNum,
                remaining,
                active,
                reason: isSoldOut ? 'Sold out' : !active ? 'GTD not active' : !eligible ? 'GTD limit reached' : ''
              }
              phases.push(phase)
              if (eligible && !bestEligibility) bestEligibility = phase
              addDebug('  ' + (eligible ? '✅' : '❌') + ' GTD: ' + remaining + ' remaining')
            } catch (e: any) {
              addDebug('  GTD check failed: ' + e.message)
            }
          }

          // PHASE 3: Free Drop (FCFS)
          if (freeDrop) {
            const active = now > freeDrop.startTime && now < freeDrop.endTime
            const remaining = Math.max(0, freeDrop.maxPerWallet - totalMinted)
            const eligible = remaining > 0 && active && !isSoldOut

            const phase: PhaseInfo = {
              phase: 'FCFS',
              eligible,
              maxMint: freeDrop.maxPerWallet,
              price: '0 ETH',
              minted: totalMinted,
              remaining,
              active,
              reason: isSoldOut ? 'Sold out' : !active ? 'FCFS not active' : !eligible ? 'FCFS limit reached' : ''
            }
            phases.push(phase)
            if (eligible && !bestEligibility) bestEligibility = phase
            addDebug('  ' + (eligible ? '✅' : '❌') + ' FCFS: ' + remaining + ' remaining')
          }

          // PHASE 4: Public
          if (publicDrop) {
            const active = now > publicDrop.startTime && now < publicDrop.endTime
            const remaining = Math.max(0, publicDrop.maxPerWallet - totalMinted)
            const eligible = remaining > 0 && active && !isSoldOut

            const phase: PhaseInfo = {
              phase: 'Public',
              eligible,
              maxMint: publicDrop.maxPerWallet,
              price: (Number(publicDrop.mintPrice) / 1e18).toString() + ' ETH',
              minted: totalMinted,
              remaining,
              active,
              reason: isSoldOut ? 'Sold out' : !active ? 'Public sale not active' : !eligible ? 'Public limit reached' : ''
            }
            phases.push(phase)
            if (eligible && !bestEligibility) bestEligibility = phase
            addDebug('  ' + (eligible ? '✅' : '❌') + ' Public: ' + remaining + ' remaining')
          }

          if (phases.length === 0) {
            phases.push({
              phase: 'None',
              eligible: false,
              maxMint: 0,
              price: '0',
              minted: 0,
              remaining: 0,
              active: false,
              reason: 'No active drops found'
            })
          }

        } catch (err: any) {
          if (phases.length === 0) {
            phases.push({
              phase: 'Error',
              eligible: false,
              maxMint: 0,
              price: '0',
              minted: 0,
              remaining: 0,
              active: false,
              reason: err.message
            })
          }
        }

        return { ...wallet, eligibility: bestEligibility, phases, lastChecked: new Date().toLocaleString() }
      }))

      setWallets(updated)
      addDebug('Done! Checked all phases.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsChecking(false)
    }
  }

  const importAllowlist = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (typeof data === 'object' && data !== null) {
          setAllowlistData(data)
          addDebug('Imported allowlist: ' + Object.keys(data).length + ' entries')
          alert('Allowlist imported! ' + Object.keys(data).length + ' wallets')
        } else {
          alert('Invalid format. Expected { "0x...": { maxMint: 2, price: "0.01" } }')
        }
      } catch { alert('Invalid JSON file') }
    }
    reader.readAsText(file)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ wallets, contractAddress, chainId, allowlistData }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'seadrop-check.json'
    a.click()
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.wallets) setWallets(data.wallets)
        if (data.contractAddress) setContractAddress(data.contractAddress)
        if (data.chainId) setChainId(data.chainId)
        if (data.allowlistData) setAllowlistData(data.allowlistData)
        alert('Imported!')
      } catch { alert('Invalid file') }
    }
    reader.readAsText(file)
  }

  const getPhaseColor = (phase: string, eligible: boolean) => {
    if (!eligible) return 'bg-red-50 border-red-200 text-red-800'
    switch (phase) {
      case 'Vault': return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'GTD': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'FCFS': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'Public': return 'bg-orange-50 border-orange-200 text-orange-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }
  const now = Math.floor(Date.now() / 1000)
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'Vault': return '🏛️'
      case 'GTD': return '🗝️'
      case 'FCFS': return '⚡'
      case 'Public': return '🌐'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌊 SeaDrop Eligibility Checker</h1>
        <p className="text-gray-600 mb-6">Check all your wallets for OpenSea NFT drops across all phases</p>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">⚠️ {error}</div>}

        {debugInfo.length > 0 && (
          <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
            <h4 className="text-white mb-2 font-bold">Debug Log:</h4>
            {debugInfo.map((msg, i) => (
              <div key={i} className={msg.includes('❌') ? 'text-red-400' : msg.includes('✅') ? 'text-green-400' : msg.includes('⚠️') ? 'text-yellow-400' : 'text-gray-400'}>
                {msg}
              </div>
            ))}
          </div>
        )}

        <div className="mb-6 bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">⚙️ Contract Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input type="text" placeholder="Contract Address (0x...)" value={contractAddress} onChange={e => setContractAddress(e.target.value)} className="md:col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
            <select value={chainId} onChange={e => setChainId(Number(e.target.value))} className="px-4 py-3 rounded-lg border border-gray-300">
              <option value={1}>Ethereum</option>
              <option value={137}>Polygon</option>
              <option value={42161}>Arbitrum</option>
              <option value={10}>Optimism</option>
              <option value={8453}>Base</option>
              <option value={11155111}>Sepolia</option>
            </select>
            <button onClick={fetchContractInfo} disabled={!contractAddress || contractAddress.length < 10} className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium">📋 Load Info</button>
          </div>

          {contractInfo && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">{contractInfo.name}</h4>

              {/* Supply */}
              <div className="mb-4">
                <span className="text-gray-500 text-sm">Supply</span>
                <p className="font-bold text-lg">{contractInfo.totalSupply} / {contractInfo.maxSupply}</p>
              </div>

              {/* Phases Table - Dynamic: only show configured phases */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Phase</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Price</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Public Phase */}
                    {contractInfo.publicDrop && (
                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-orange-700">🌐 Public</td>
                        <td className="px-4 py-3 text-gray-600">{contractInfo.publicDrop.price}</td>
                        <td className="px-4 py-3">
                          {contractInfo.publicDrop.active ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">🟢 Active</span>
                          ) : now < contractInfo.publicDrop.startTime ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">⏳ Not Started</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">🔴 Ended</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {contractInfo.publicDrop.startTime && contractInfo.publicDrop.endTime ? (
                            <>
                              {new Date(contractInfo.publicDrop.startTime * 1000).toLocaleString()} - {new Date(contractInfo.publicDrop.endTime * 1000).toLocaleString()}
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                    )}

                    {/* Allowlist Phase */}
                    {contractInfo.allowlistRoot && (
                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-purple-700">🎫 Allowlist</td>
                        <td className="px-4 py-3 text-gray-600">Allowlist Only</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">✅ Configured</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">-</td>
                      </tr>
                    )}

                    {/* Token Gated Phase */}
                    {contractInfo.tokenGatedDrop && (
                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-blue-700">🗝️ Token Gated</td>
                        <td className="px-4 py-3 text-gray-600">{contractInfo.tokenGatedDrop.price}</td>
                        <td className="px-4 py-3">
                          {contractInfo.tokenGatedDrop.active ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">🟢 Active</span>
                          ) : now < contractInfo.tokenGatedDrop.startTime ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">⏳ Not Started</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">🔴 Ended</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {contractInfo.tokenGatedDrop.startTime && contractInfo.tokenGatedDrop.endTime ? (
                            <>
                              {new Date(contractInfo.tokenGatedDrop.startTime * 1000).toLocaleString()} - {new Date(contractInfo.tokenGatedDrop.endTime * 1000).toLocaleString()}
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                    )}

                    {/* Free Drop Phase */}
                    {contractInfo.freeDrop && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-green-700">🎁 Free Drop</td>
                        <td className="px-4 py-3 text-gray-600">0 ETH</td>
                        <td className="px-4 py-3">
                          {contractInfo.freeDrop.active ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">🟢 Active</span>
                          ) : now < contractInfo.freeDrop.startTime ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">⏳ Not Started</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">🔴 Ended</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {contractInfo.freeDrop.startTime && contractInfo.freeDrop.endTime ? (
                            <>
                              {new Date(contractInfo.freeDrop.startTime * 1000).toLocaleString()} - {new Date(contractInfo.freeDrop.endTime * 1000).toLocaleString()}
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                    )}

                    {/* No phases configured */}
                    {!contractInfo.publicDrop && !contractInfo.allowlistRoot && !contractInfo.tokenGatedDrop && !contractInfo.freeDrop && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                          No drop phases configured on this contract
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">➕ Add Wallet</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Wallet Address (0x...)" value={newWallet.address} onChange={e => setNewWallet(p => ({ ...p, address: e.target.value }))} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none" />
            <input type="text" placeholder="Label" value={newWallet.label} onChange={e => setNewWallet(p => ({ ...p, label: e.target.value }))} className="md:w-48 px-4 py-3 rounded-lg border border-gray-300" />
            <button onClick={addWallet} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold">Add</button>
          </div>
        </div>

        {Object.keys(allowlistData).length > 0 && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-purple-800 font-medium">
              🎫 Allowlist data loaded: {Object.keys(allowlistData).length} wallets
            </p>
          </div>
        )}

        {wallets.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">👛 Wallets ({wallets.length})</h3>
              <div className="flex gap-2 flex-wrap">
                <button onClick={checkEligibility} disabled={isChecking} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium">{isChecking ? '⏳ Checking...' : '🔍 Check All'}</button>
                <label className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium cursor-pointer">🎫 Import Allowlist<input type="file" accept=".json" onChange={importAllowlist} className="hidden" /></label>
                <button onClick={exportData} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">📥 Export</button>
                <label className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium cursor-pointer">📤 Import<input type="file" accept=".json" onChange={importData} className="hidden" /></label>
              </div>
            </div>

            <div className="space-y-3">
              {wallets.map(wallet => (
                <div key={wallet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-gray-900">{wallet.label}</span>
                        <code className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</code>
                        {wallet.eligibility && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${wallet.eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {wallet.eligibility.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}
                          </span>
                        )}
                      </div>

                      {wallet.phases.length > 0 ? (
                        <div className="space-y-2">
                          {wallet.phases.map((phase, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${getPhaseColor(phase.phase, phase.eligible)}`}>
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-bold">{getPhaseIcon(phase.phase)} {phase.phase}</span>
                                <span className={phase.active ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                                  {phase.active ? '🟢 Active' : '🔴 Inactive'}
                                </span>
                                <span>💰 {phase.price}</span>
                                <span>📝 {phase.minted} minted</span>
                                <span>✨ {phase.remaining} remaining</span>
                                {phase.maxMint > 0 && <span>📊 Max: {phase.maxMint}</span>}
                              </div>
                              {phase.reason && (
                                <p className="text-sm mt-1 opacity-80 font-medium">{phase.reason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 text-sm">
                          Click "Check All" to verify eligibility
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeWallet(wallet.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}