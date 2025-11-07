import Web3 from 'web3'
import { JsonRpcProvider, formatUnits } from 'ethers'
import CryptoJS from 'crypto-js'
import QRCode from 'qrcode-generator'
import { v4 as uuidv4 } from 'uuid'

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  // Using Polygon Mumbai testnet for development
  NETWORK_ID: 80001,
  RPC_URL: 'https://rpc-mumbai.maticvigil.com/',
  BLOCK_EXPLORER: 'https://mumbai.polygonscan.com',
  NATIVE_CURRENCY: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
}

// Product tracking interface
export interface BlockchainProduct {
  id: string
  name: string
  category: string
  manufacturer: string
  batchNumber: string
  productionDate: string
  expiryDate?: string
  temperature?: {
    min: number
    max: number
    current: number
  }
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  certifications: string[]
  blockchain: {
    transactionHash: string
    blockNumber: number
    timestamp: number
    verified: boolean
  }
}

// Blockchain service class
export class BlockchainService {
  private web3: Web3
  private provider: JsonRpcProvider

  constructor() {
    this.web3 = new Web3(BLOCKCHAIN_CONFIG.RPC_URL)
    this.provider = new JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL)
  }

  // Generate secure product ID with blockchain hash
  generateProductId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const uuid = uuidv4()
    
    const data = `${timestamp}-${random}-${uuid}`
    const hash = CryptoJS.SHA256(data).toString()
    
    return hash.substring(0, 16).toUpperCase()
  }

  // Create blockchain record for product
  async createProductRecord(product: Omit<BlockchainProduct, 'blockchain'>): Promise<BlockchainProduct> {
    try {
      // Create product hash for blockchain storage
      const productData = {
        ...product,
        timestamp: Date.now(),
        version: '1.0'
      }
      
      const productHash = CryptoJS.SHA256(JSON.stringify(productData)).toString()
      
      // Simulate blockchain transaction (in real app, would interact with smart contract)
      const mockTransaction = {
        transactionHash: `0x${CryptoJS.SHA256(productHash + Date.now()).toString()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        timestamp: Date.now(),
        verified: true
      }

      return {
        ...product,
        blockchain: mockTransaction
      }
    } catch (error) {
      console.error('Error creating blockchain record:', error)
      throw new Error('Failed to create blockchain record')
    }
  }

  // Verify product authenticity
  async verifyProduct(productId: string): Promise<{
    verified: boolean
    product?: BlockchainProduct
    error?: string
  }> {
    try {
      // In real implementation, would query blockchain
      // For demo, simulate verification
      const isValid = productId.length === 16 && /^[A-F0-9]+$/.test(productId)
      
      if (!isValid) {
        return { verified: false, error: 'Invalid product ID format' }
      }

      // Mock successful verification
      return {
        verified: true,
        product: await this.getMockProductData(productId)
      }
    } catch (error) {
      return { verified: false, error: 'Verification failed' }
    }
  }

  // Generate QR code with blockchain data
  generateQRCode(product: BlockchainProduct, size: number = 4): string {
    const qrData = {
      id: product.id,
      name: product.name,
      batch: product.batchNumber,
      txHash: product.blockchain.transactionHash,
      verify: `${window.location.origin}/verify/${product.id}`
    }

    const qr = QRCode(0, 'L')
    qr.addData(JSON.stringify(qrData))
    qr.make()
    
    return qr.createDataURL(size)
  }

  // Get product supply chain history
  async getSupplyChainHistory(productId: string): Promise<{
    events: Array<{
      type: 'production' | 'transport' | 'storage' | 'inspection' | 'delivery'
      timestamp: number
      location: string
      temperature?: number
      notes?: string
      verifiedBy: string
      transactionHash: string
    }>
  }> {
    // Mock supply chain events
    const events = [
      {
        type: 'production' as const,
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        location: 'Nhà máy ABC, TP.HCM',
        temperature: 22,
        notes: 'Sản xuất hoàn thành, kiểm tra chất lượng OK',
        verifiedBy: 'Nguyễn Văn A',
        transactionHash: '0x' + CryptoJS.SHA256('production-' + productId).toString().substring(0, 64)
      },
      {
        type: 'transport' as const,
        timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        location: 'Trung tâm phân phối Hà Nội',
        temperature: 4,
        notes: 'Vận chuyển lạnh, nhiệt độ ổn định',
        verifiedBy: 'Trần Thị B',
        transactionHash: '0x' + CryptoJS.SHA256('transport-' + productId).toString().substring(0, 64)
      },
      {
        type: 'storage' as const,
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        location: 'Kho lạnh Đông Anh',
        temperature: 2,
        notes: 'Lưu trữ theo tiêu chuẩn, kiểm tra định kỳ',
        verifiedBy: 'Lê Văn C',
        transactionHash: '0x' + CryptoJS.SHA256('storage-' + productId).toString().substring(0, 64)
      }
    ]

    return { events }
  }

  // Mock product data for demo
  private async getMockProductData(productId: string): Promise<BlockchainProduct> {
    return {
      id: productId,
      name: 'Sữa tươi Vinamilk',
      category: 'Dairy',
      manufacturer: 'Vinamilk Co., Ltd',
      batchNumber: 'VNM-' + productId.substring(0, 8),
      productionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      temperature: {
        min: 2,
        max: 6,
        current: 4
      },
      location: {
        latitude: 21.0285,
        longitude: 105.8542,
        address: 'Hà Nội, Việt Nam'
      },
      certifications: ['HACCP', 'ISO 22000', 'Organic'],
      blockchain: {
        transactionHash: '0x' + CryptoJS.SHA256(productId + 'blockchain').toString(),
        blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        verified: true
      }
    }
  }

  // Get blockchain network status
  async getNetworkStatus(): Promise<{
    connected: boolean
    chainId?: number
    blockNumber?: number
    gasPrice?: string
  }> {
    try {
      const blockNumber = await this.provider.getBlockNumber()
      const feeData = await this.provider.getFeeData()
      
      return {
        connected: true,
        chainId: BLOCKCHAIN_CONFIG.NETWORK_ID,
        blockNumber,
        gasPrice: feeData.gasPrice ? formatUnits(feeData.gasPrice, 'gwei') : '0'
      }
    } catch {
      return { connected: false }
    }
  }

  // Format blockchain transaction for display
  formatTransaction(txHash: string): {
    short: string
    explorer: string
  } {
    return {
      short: `${txHash.substring(0, 6)}...${txHash.substring(txHash.length - 4)}`,
      explorer: `${BLOCKCHAIN_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService()