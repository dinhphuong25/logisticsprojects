/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServer, Model, Factory, Response } from 'miragejs'

export function makeServer() {
  return createServer({
    models: {
      warehouse: Model,
      zone: Model,
      location: Model,
      product: Model,
      lot: Model,
      inventory: Model,
      sensor: Model,
      alert: Model,
      user: Model,
      inbound: Model,
      outbound: Model,
    },

    factories: {
      warehouse: Factory.extend({
        name: (i) => `Warehouse ${i}`,
        code: (i) => `WH-${String(i).padStart(2, '0')}`,
      }),
    },

    seeds(server) {
      // Create Users
      server.create('user', {
        id: 'user-1',
        email: 'admin@wms.com',
        password: '12345678',
        name: 'Đình Phương',
        nameVi: 'Đình Phương',
        role: 'ADMIN',
        warehouseIds: ['wh-1', 'wh-2'],
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
      })

      server.create('user', {
        id: 'user-2',
        email: 'supervisor@wms.com',
        password: '12345678',
        name: 'Supervisor User',
        nameVi: 'Giám sát viên',
        role: 'SUPERVISOR',
        warehouseIds: ['wh-1'],
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
      })

      server.create('user', {
        id: 'user-3',
        email: 'operator@wms.com',
        password: '12345678',
        name: 'Operator User',
        nameVi: 'Nhân viên kho',
        role: 'OPERATOR',
        warehouseIds: ['wh-1'],
        status: 'ACTIVE',
        createdAt: '2025-01-01T00:00:00Z',
      })

      // Create Warehouses
      const wh1 = server.create('warehouse', {
        id: 'wh-1',
        name: 'HCM Cold Storage',
        nameVi: 'Kho Lạnh TP.HCM',
        code: 'HCM-01',
        address: '123 Đường D1, Khu Công Nghệ Cao, TP.HCM',
        location: { lat: 10.8231, lng: 106.6297 },
        totalCapacity: 50000,
        usedCapacity: 35000,
      })

      server.create('warehouse', {
        id: 'wh-2',
        name: 'Long An Distribution Center',
        nameVi: 'Trung Tâm Phân Phối Long An',
        code: 'LA-01',
        address: '456 Quốc Lộ 1A, Long An',
        location: { lat: 10.5356, lng: 106.4056 },
        totalCapacity: 30000,
        usedCapacity: 20000,
      })

      // Create Zones for WH1
      const chillZone = server.create('zone', {
        id: 'zone-1',
        warehouseId: wh1.id,
        name: 'CHILL ZONE A',
        nameVi: 'KHU MÁT A',
        type: 'CHILL',
        tempMin: 2,
        tempMax: 8,
        tempTarget: 5,
        capacity: 25000,
        used: 18000,
      })

      const frozenZone = server.create('zone', {
        id: 'zone-2',
        warehouseId: wh1.id,
        name: 'FROZEN ZONE B',
        nameVi: 'KHU ĐÔNG B',
        type: 'FROZEN',
        tempMin: -25,
        tempMax: -18,
        tempTarget: -22,
        capacity: 25000,
        used: 17000,
      })

      // Create Locations with varied data
      const statusOptions = ['EMPTY', 'OCCUPIED', 'FULL', 'RESERVED', 'BLOCKED']
      const statusWeights = [0.15, 0.45, 0.25, 0.10, 0.05] // 15% empty, 45% occupied, 25% full, 10% reserved, 5% blocked
      
      const getRandomStatus = () => {
        const rand = Math.random()
        let cumulative = 0
        for (let i = 0; i < statusWeights.length; i++) {
          cumulative += statusWeights[i]
          if (rand < cumulative) return statusOptions[i]
        }
        return 'OCCUPIED'
      }

      for (let i = 1; i <= 20; i++) {
        const level = Math.ceil(i / 5)
        const slot = String((i % 5) || 5).padStart(2, '0')
        
        // Varied max capacity (800-1200)
        const maxQty = 800 + Math.floor(Math.random() * 400)
        
        // Get random status
        const status = getRandomStatus()
        
        // Calculate currentQty based on status
        let currentQty
        switch (status) {
          case 'EMPTY':
            currentQty = 0
            break
          case 'FULL':
            currentQty = maxQty
            break
          case 'RESERVED':
            currentQty = Math.floor(maxQty * (0.2 + Math.random() * 0.3)) // 20-50% full
            break
          case 'BLOCKED':
            currentQty = 0
            break
          case 'OCCUPIED':
          default:
            // Occupied: 10-95% full with varied distribution
            const occupancyRate = 0.1 + Math.random() * 0.85
            currentQty = Math.floor(maxQty * occupancyRate)
            break
        }
        
        server.create('location', {
          id: `loc-${i}`,
          zoneId: i <= 10 ? chillZone.id : frozenZone.id,
          code: `A-${String(level).padStart(2, '0')}-${slot}`,
          rack: 'A',
          level: String(level).padStart(2, '0'),
          slot,
          maxQty,
          currentQty,
          cubic: 8 + Math.random() * 4, // 8-12 cubic meters
          status,
        })
      }

      // Create Products
      const products = [
        {
          id: 'prod-1',
          sku: 'SKU-001',
          name: 'Frozen Salmon',
          nameVi: 'Cá hồi đông lạnh',
          unit: 'KG',
          tempClass: 'FROZEN',
          shelfLifeDays: 90,
          weight: 1,
          cubic: 0.01,
          category: 'SEAFOOD',
        },
        {
          id: 'prod-2',
          sku: 'SKU-002',
          name: 'Fresh Beef',
          nameVi: 'Thịt bò tươi',
          unit: 'KG',
          tempClass: 'CHILL',
          shelfLifeDays: 30,
          weight: 1,
          cubic: 0.008,
          category: 'MEAT',
        },
        {
          id: 'prod-3',
          sku: 'SKU-003',
          name: 'Frozen Shrimp',
          nameVi: 'Tôm đông lạnh',
          unit: 'KG',
          tempClass: 'FROZEN',
          shelfLifeDays: 120,
          weight: 1,
          cubic: 0.012,
          category: 'SEAFOOD',
        },
      ]

      products.forEach((p) => server.create('product', p))

      // Create Lots and Inventory
      products.forEach((product, idx) => {
        const lot = server.create('lot', {
          id: `lot-${idx + 1}`,
          productId: product.id,
          lotNo: `LOT-20251102-${String(idx + 1).padStart(3, '0')}`,
          mfgDate: '2025-10-15',
          expDate: '2025-12-15',
          originCountry: 'VN',
          supplier: 'Supplier ABC',
          totalQty: 5000,
          availableQty: 5000,
          allocatedQty: 0,
          status: 'AVAILABLE',
        })

        // Create inventory entries for this lot
        for (let i = 0; i < 3; i++) {
          const locationId = `loc-${idx * 3 + i + 1}`
          server.create('inventory', {
            id: `inv-${idx * 3 + i + 1}`,
            lotId: lot.id,
            locationId,
            qty: Math.floor(Math.random() * 500) + 100,
            updatedAt: new Date().toISOString(),
          })
        }
      })

      // Create Sensors
      server.create('sensor', {
        id: 'sensor-1',
        zoneId: chillZone.id,
        name: 'CHILL-TEMP-01',
        nameVi: 'Cảm biến nhiệt độ KHU MÁT 01',
        type: 'TEMPERATURE',
        location: 'Góc A, tầng 1',
        currentValue: 5.2,
        unit: '°C',
        status: 'ONLINE',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 95,
      })

      server.create('sensor', {
        id: 'sensor-2',
        zoneId: chillZone.id,
        name: 'CHILL-TEMP-02',
        nameVi: 'Cảm biến nhiệt độ KHU MÁT 02',
        type: 'TEMPERATURE',
        location: 'Góc B, tầng 2',
        currentValue: 4.8,
        unit: '°C',
        status: 'ONLINE',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 88,
      })

      server.create('sensor', {
        id: 'sensor-3',
        zoneId: frozenZone.id,
        name: 'FROZEN-TEMP-01',
        nameVi: 'Cảm biến nhiệt độ KHU ĐÔNG 01',
        type: 'TEMPERATURE',
        location: 'Góc A, tầng 1',
        currentValue: -21.5,
        unit: '°C',
        status: 'ONLINE',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 92,
      })

      server.create('sensor', {
        id: 'sensor-4',
        zoneId: frozenZone.id,
        name: 'FROZEN-TEMP-02',
        nameVi: 'Cảm biến nhiệt độ KHU ĐÔNG 02',
        type: 'TEMPERATURE',
        location: 'Góc B, tầng 2',
        currentValue: -22.3,
        unit: '°C',
        status: 'WARNING',
        lastUpdated: new Date().toISOString(),
        batteryLevel: 78,
      })

      // Create initial alerts
      server.create('alert', {
        id: 'alert-1',
        type: 'TEMP_HIGH',
        severity: 'HIGH',
        title: 'Temperature Excursion',
        titleVi: 'Vượt ngưỡng nhiệt độ',
        message: 'FROZEN ZONE B temperature is above threshold',
        messageVi: 'Nhiệt độ KHU ĐÔNG B vượt ngưỡng cho phép',
        warehouseId: wh1.id,
        zoneId: frozenZone.id,
        sensorId: 'sensor-4',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'OPEN',
      })

      server.create('alert', {
        id: 'alert-2',
        type: 'EXPIRY_WARNING',
        severity: 'MEDIUM',
        title: 'Products Expiring Soon',
        titleVi: 'Sản phẩm sắp hết hạn',
        message: '3 lots expiring within 7 days',
        messageVi: '3 lô hàng sẽ hết hạn trong vòng 7 ngày',
        warehouseId: wh1.id,
        lotId: 'lot-1',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        status: 'OPEN',
      })

      // Inbound Orders
      server.create('inbound', {
        id: 'inb-1',
        orderNo: 'IB-20251102-001',
        warehouseId: wh1.id,
        supplier: 'Fresh Seafood Co.',
        carrier: 'DHL Cold Chain',
        trailerNo: 'TRL-1234',
        eta: new Date(Date.now() + 86400000).toISOString(),
        status: 'PENDING',
        lines: [
          {
            id: 'line-1',
            productId: 'prod-1',
            expectedQty: 500,
            receivedQty: 0,
            product: { name: 'Salmon Fillet', sku: 'SKU-001', unit: 'KG' },
          },
        ],
        totalQty: 500,
        receivedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('inbound', {
        id: 'inb-2',
        orderNo: 'IB-20251102-002',
        warehouseId: wh1.id,
        supplier: 'Wagyu Beef Ltd',
        carrier: 'FedEx Frozen',
        trailerNo: 'TRL-5678',
        eta: new Date(Date.now() + 172800000).toISOString(),
        status: 'SCHEDULED',
        lines: [
          {
            id: 'line-2',
            productId: 'prod-2',
            expectedQty: 300,
            receivedQty: 0,
            product: { name: 'Wagyu Beef', sku: 'SKU-002', unit: 'KG' },
          },
        ],
        totalQty: 300,
        receivedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('inbound', {
        id: 'inb-3',
        orderNo: 'IB-20251101-015',
        warehouseId: wh1.id,
        supplier: 'Frozen Veg Corp',
        carrier: 'Local Transport',
        trailerNo: 'TRL-9999',
        eta: new Date(Date.now() - 3600000).toISOString(),
        status: 'COMPLETED',
        lines: [
          {
            id: 'line-3',
            productId: 'prod-3',
            expectedQty: 800,
            receivedQty: 800,
            product: { name: 'Mixed Vegetables', sku: 'SKU-003', unit: 'KG' },
          },
        ],
        totalQty: 800,
        receivedQty: 800,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('inbound', {
        id: 'inb-4',
        orderNo: 'IB-20251102-003',
        warehouseId: wh1.id,
        supplier: 'Ocean Fresh Ltd.',
        carrier: 'Cold Chain Express',
        trailerNo: 'TRL-4444',
        eta: new Date(Date.now() - 1800000).toISOString(),
        arrivalTime: new Date(Date.now() - 1800000).toISOString(),
        status: 'RECEIVING',
        lines: [
          {
            id: 'line-4',
            productId: 'prod-1',
            expectedQty: 450,
            receivedQty: 280,
            product: { name: 'Salmon Fillet', sku: 'SKU-001', unit: 'KG' },
          },
        ],
        totalQty: 450,
        receivedQty: 280,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('inbound', {
        id: 'inb-5',
        orderNo: 'IB-20251102-004',
        warehouseId: wh1.id,
        supplier: 'Premium Meat Suppliers',
        carrier: 'Frozen Logistics',
        trailerNo: 'TRL-5555',
        eta: new Date(Date.now() + 21600000).toISOString(),
        status: 'SCHEDULED',
        lines: [
          {
            id: 'line-5',
            productId: 'prod-2',
            expectedQty: 380,
            receivedQty: 0,
            product: { name: 'Wagyu Beef', sku: 'SKU-002', unit: 'KG' },
          },
        ],
        totalQty: 380,
        receivedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      // Outbound Orders
      server.create('outbound', {
        id: 'out-1',
        orderNo: 'OB-20251102-001',
        warehouseId: wh1.id,
        customer: 'Seafood Restaurant Chain',
        customerAddress: '123 Restaurant St., District 1, HCMC',
        carrier: 'Express Cold Logistics',
        trailerNo: 'TRL-2001',
        etd: new Date(Date.now() + 43200000).toISOString(),
        departureTime: new Date(Date.now() + 43200000).toISOString(),
        status: 'RELEASED',
        priority: 'HIGH',
        lines: [
          {
            id: 'out-line-1',
            productId: 'prod-1',
            requestedQty: 250,
            pickedQty: 0,
            product: { name: 'Salmon Fillet', sku: 'SKU-001' },
          },
        ],
        totalQty: 250,
        pickedQty: 0,
        shippedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('outbound', {
        id: 'out-2',
        orderNo: 'OB-20251102-002',
        warehouseId: wh1.id,
        customer: 'Premium Steakhouse',
        customerAddress: '456 Food Court, District 3, HCMC',
        carrier: 'Premium Transport',
        trailerNo: 'TRL-2002',
        etd: new Date(Date.now() + 86400000).toISOString(),
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        status: 'PICKING',
        priority: 'URGENT',
        lines: [
          {
            id: 'out-line-2',
            productId: 'prod-2',
            requestedQty: 150,
            pickedQty: 75,
            product: { name: 'Wagyu Beef', sku: 'SKU-002' },
          },
        ],
        totalQty: 150,
        pickedQty: 75,
        shippedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('outbound', {
        id: 'out-3',
        orderNo: 'OB-20251101-025',
        warehouseId: wh1.id,
        customer: 'Hotel Food Services',
        customerAddress: '789 Hotel Blvd., District 7, HCMC',
        carrier: 'Local Delivery',
        trailerNo: 'TRL-2003',
        etd: new Date(Date.now() - 7200000).toISOString(),
        departureTime: new Date(Date.now() - 7200000).toISOString(),
        status: 'SHIPPED',
        priority: 'NORMAL',
        lines: [
          {
            id: 'out-line-3',
            productId: 'prod-3',
            requestedQty: 500,
            pickedQty: 500,
            product: { name: 'Mixed Vegetables', sku: 'SKU-003' },
          },
        ],
        totalQty: 500,
        pickedQty: 500,
        shippedQty: 500,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('outbound', {
        id: 'out-4',
        orderNo: 'OB-20251102-003',
        warehouseId: wh1.id,
        customer: 'Supermarket Chain',
        customerAddress: '321 Market St., District 5, HCMC',
        carrier: 'Fast Delivery',
        trailerNo: 'TRL-2004',
        etd: new Date(Date.now() + 14400000).toISOString(),
        departureTime: new Date(Date.now() + 14400000).toISOString(),
        status: 'PICKED',
        priority: 'HIGH',
        lines: [
          {
            id: 'out-line-4',
            productId: 'prod-1',
            requestedQty: 180,
            pickedQty: 180,
            product: { name: 'Salmon Fillet', sku: 'SKU-001' },
          },
        ],
        totalQty: 180,
        pickedQty: 180,
        shippedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      server.create('outbound', {
        id: 'out-5',
        orderNo: 'OB-20251102-004',
        warehouseId: wh1.id,
        customer: 'Restaurant Group',
        customerAddress: '555 Food Plaza, District 2, HCMC',
        carrier: 'Quick Transport',
        trailerNo: 'TRL-2005',
        etd: new Date(Date.now() + 28800000).toISOString(),
        departureTime: new Date(Date.now() + 28800000).toISOString(),
        status: 'LOADED',
        priority: 'NORMAL',
        lines: [
          {
            id: 'out-line-5',
            productId: 'prod-2',
            requestedQty: 220,
            pickedQty: 220,
            product: { name: 'Wagyu Beef', sku: 'SKU-002' },
          },
        ],
        totalQty: 220,
        pickedQty: 220,
        shippedQty: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'admin@wms.com',
      })

      // Start real-time sensor simulation
      startSensorSimulation(server)
    },

    routes() {
      this.namespace = 'api'
      this.timing = 500

      // Auth endpoints
      this.post('/auth/login', (schema: any, request) => {
        const { email } = JSON.parse(request.requestBody)
        const user = schema.db.users.findBy({ email })

        if (!user) {
          return new Response(401, {}, { error: 'Invalid credentials' })
        }

        return {
          token: `fake-jwt-token-${user.id}`,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            nameVi: user.nameVi,
            role: user.role,
            warehouseIds: user.warehouseIds,
            status: user.status,
          },
        }
      })

      // Warehouses
      this.get('/warehouses', (schema: any) => {
        return schema.db.warehouses
      })

      // KPIs
      this.get('/kpis', (schema: any) => {
        const chillInventory = schema.db.inventories.where((inv: unknown) => {
          const lot = schema.db.lots.find((inv as { lotId: string }).lotId)
          const product = schema.db.products.find((lot as { productId: string }).productId)
          return (product as { tempClass: string }).tempClass === 'CHILL'
        })

        const frozenInventory = schema.db.inventories.where((inv: unknown) => {
          const lot = schema.db.lots.find((inv as { lotId: string }).lotId)
          const product = schema.db.products.find((lot as { productId: string }).productId)
          return (product as { tempClass: string }).tempClass === 'FROZEN'
        })

        const onHandChill = chillInventory.reduce((sum: number, inv: unknown) => sum + (inv as { qty: number }).qty, 0)
        const onHandFrozen = frozenInventory.reduce((sum: number, inv: unknown) => sum + (inv as { qty: number }).qty, 0)
        const openAlerts = schema.db.alerts.where({ status: 'OPEN' }).length

        return {
          inboundToday: 15,
          outboundToday: 12,
          onHandChill,
          onHandFrozen,
          openAlerts,
          dockOnTimePercent: 95,
        }
      })

      // Inventory
      this.get('/inventory', (schema: any) => {
        const inventories = schema.db.inventories

        return inventories.map((inv: any) => {
          const lot = schema.db.lots.find(inv.lotId)
          const product = schema.db.products.find(lot?.productId)
          const location = schema.db.locations.find(inv.locationId)
          const zone = schema.db.zones.find(location?.zoneId)

          return {
            ...inv,
            lot,
            product,
            location,
            zone,
          }
        })
      })

      // Sensors
      this.get('/sensors', (schema: any) => {
        return schema.db.sensors.map((sensor: any) => {
          const zone = schema.db.zones.find(sensor.zoneId)
          return {
            ...sensor,
            zone,
          }
        })
      })

      // Alerts
      this.get('/alerts', (schema: any) => {
        return schema.db.alerts.map((alert: any) => {
          const zone = alert.zoneId ? schema.db.zones.find(alert.zoneId) : null
          return {
            ...alert,
            zone,
          }
        })
      })

      this.post('/alerts/:id/resolve', (schema: any, request) => {
        const alert = schema.db.alerts.find(request.params.id)
        if (alert) {
          ;(alert as { status: string; resolvedAt: string }).status = 'RESOLVED'
          ;(alert as { status: string; resolvedAt: string }).resolvedAt = new Date().toISOString()
          schema.db.alerts.update(request.params.id, alert)
        }
        return alert
      })

      // Inbound Orders
      this.get('/inbound', (schema: any) => {
        return schema.db.inbounds
      })

      this.post('/inbound', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newOrder = {
          id: `inb-${Date.now()}`,
          ...attrs,
          createdAt: new Date().toISOString(),
          createdBy: 'admin@wms.com',
          totalQty: attrs.lines?.reduce((sum: number, line: any) => sum + line.expectedQty, 0) || 0,
          receivedQty: 0,
        }
        const order = schema.db.inbounds.insert(newOrder)
        return order
      })

      this.put('/inbound/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const order = schema.db.inbounds.update(request.params.id, attrs)
        return order
      })

      // Outbound Orders
      this.get('/outbound', (schema: any) => {
        return { outbounds: schema.db.outbounds }
      })

      this.post('/outbound', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newOrder = {
          id: `out-${Date.now()}`,
          ...attrs,
          createdAt: new Date().toISOString(),
          createdBy: 'admin@wms.com',
          totalQty: attrs.lines?.reduce((sum: number, line: any) => sum + line.requestedQty, 0) || 0,
          pickedQty: 0,
          shippedQty: 0,
        }
        const order = schema.db.outbounds.insert(newOrder)
        return order
      })

      this.put('/outbound/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const order = schema.db.outbounds.update(request.params.id, attrs)
        return order
      })

      // Zones
      this.get('/zones', (schema: any) => {
        return schema.db.zones
      })

      this.post('/zones', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const zone = schema.db.zones.insert(attrs)
        return zone
      })

      this.put('/zones/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const zone = schema.db.zones.update(request.params.id, attrs)
        return zone
      })

      this.delete('/zones/:id', (schema: any, request) => {
        schema.db.zones.remove(request.params.id)
        return { success: true }
      })

      // Locations
      this.get('/locations', (schema: any) => {
        return schema.db.locations
      })

      this.put('/locations/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const location = schema.db.locations.update(request.params.id, attrs)
        return location
      })

      // Settings
      this.get('/settings', () => {
        return {
          warehouses: [
            {
              id: 'wh-1',
              name: 'Cold Storage Facility 1',
              tempMin: -25,
              tempMax: 8,
              alertThreshold: 2.0,
              autoAlertEnabled: true,
            },
          ],
          alertRules: {
            tempExcursionMinutes: 15,
            lowStockPercentage: 20,
            expiryWarningDays: 7,
          },
          notifications: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
          },
        }
      })

      this.put('/settings', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        return { success: true, data: attrs }
      })

      // Products
      this.get('/products', (schema: any) => {
        return schema.db.products
      })

      this.post('/products', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const product = schema.db.products.insert(attrs)
        return product
      })

      this.put('/products/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const product = schema.db.products.update(request.params.id, attrs)
        return product
      })

      this.delete('/products/:id', (schema: any, request) => {
        schema.db.products.remove(request.params.id)
        return { success: true }
      })

      // Lots (for inventory management)
      this.get('/lots', (schema: any) => {
        return schema.db.lots
      })

      this.post('/lots', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newLot = {
          id: `lot-${Date.now()}`,
          ...attrs,
        }
        const lot = schema.db.lots.insert(newLot)
        return lot
      })

      this.put('/lots/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const lot = schema.db.lots.update(request.params.id, attrs)
        return lot
      })

      // Inventory Management
      this.post('/inventory', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const newInventory = {
          id: `inv-${Date.now()}`,
          ...attrs,
        }
        const inventory = schema.db.inventories.insert(newInventory)
        
        // Update location currentQty
        const location = schema.db.locations.find(attrs.locationId)
        if (location) {
          const newQty = (location as { currentQty: number }).currentQty + attrs.qty
          schema.db.locations.update(attrs.locationId, {
            currentQty: newQty,
            status: newQty >= (location as { maxQty: number }).maxQty ? 'FULL' : newQty > 0 ? 'OCCUPIED' : 'EMPTY',
          })
        }

        return inventory
      })

      this.put('/inventory/:id', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const inventory = schema.db.inventories.update(request.params.id, attrs)
        return inventory
      })

      this.delete('/inventory/:id', (schema: any, request) => {
        const inventory = schema.db.inventories.find(request.params.id)
        if (inventory) {
          // Update location currentQty
          const location = schema.db.locations.find((inventory as { locationId: string }).locationId)
          if (location) {
            const newQty = Math.max(0, (location as { currentQty: number }).currentQty - (inventory as { qty: number }).qty)
            schema.db.locations.update((inventory as { locationId: string }).locationId, {
              currentQty: newQty,
              status: newQty >= (location as { maxQty: number }).maxQty ? 'FULL' : newQty > 0 ? 'OCCUPIED' : 'EMPTY',
            })
          }
        }
        schema.db.inventories.remove(request.params.id)
        return { success: true }
      })

      // Solar Energy Management
      this.get('/energy/solar', () => {
        const now = new Date()
        const hour = now.getHours()
        
        // Solar generation varies by time of day
        const getSolarGeneration = () => {
          if (hour >= 6 && hour <= 18) {
            // Peak generation between 11-14
            const peakHour = 12.5
            const distance = Math.abs(hour - peakHour)
            const generation = Math.max(0, 45 - (distance * 3)) + (Math.random() * 5)
            return Math.round(generation * 10) / 10
          }
          return 0
        }

        const currentGeneration = getSolarGeneration()
        const batteryCharge = 65 + (Math.random() * 10)
        const gridPower = Math.max(0, 80 - currentGeneration + (Math.random() * 10))

        return {
          solar: {
            currentGeneration: currentGeneration,
            todayGeneration: Math.round((currentGeneration * 10 + 120) * 10) / 10,
            monthGeneration: 3450 + Math.random() * 500,
            status: currentGeneration > 0 ? 'GENERATING' : 'STANDBY',
          },
          battery: {
            charge: Math.round(batteryCharge * 10) / 10,
            capacity: 100,
            status: batteryCharge > 80 ? 'CHARGING' : batteryCharge > 20 ? 'NORMAL' : 'LOW',
            timeToFull: batteryCharge > 80 ? '0.5h' : '2.5h',
          },
          grid: {
            currentUsage: Math.round(gridPower * 10) / 10,
            todayUsage: 450 + Math.random() * 50,
            cost: 1250 + Math.random() * 100,
          },
          savings: {
            todaySavings: Math.round((currentGeneration * 0.15 + 18) * 100) / 100,
            monthSavings: 425 + Math.random() * 50,
            co2Reduced: 2.5 + Math.random() * 0.5,
          },
          panels: [
            {
              id: 'panel-1',
              name: 'Panel A1',
              location: 'Mái nhà khu A',
              status: currentGeneration > 0 ? 'ACTIVE' : 'STANDBY',
              efficiency: 94 + Math.random() * 5,
              currentOutput: Math.round(currentGeneration * 0.25 * 10) / 10,
              maxOutput: 12,
            },
            {
              id: 'panel-2',
              name: 'Panel A2',
              location: 'Mái nhà khu A',
              status: currentGeneration > 0 ? 'ACTIVE' : 'STANDBY',
              efficiency: 92 + Math.random() * 5,
              currentOutput: Math.round(currentGeneration * 0.24 * 10) / 10,
              maxOutput: 12,
            },
            {
              id: 'panel-3',
              name: 'Panel B1',
              location: 'Mái nhà khu B',
              status: currentGeneration > 0 ? 'ACTIVE' : 'STANDBY',
              efficiency: 95 + Math.random() * 4,
              currentOutput: Math.round(currentGeneration * 0.26 * 10) / 10,
              maxOutput: 12,
            },
            {
              id: 'panel-4',
              name: 'Panel B2',
              location: 'Mái nhà khu B',
              status: Math.random() > 0.1 ? (currentGeneration > 0 ? 'ACTIVE' : 'STANDBY') : 'FAULT',
              efficiency: Math.random() > 0.1 ? 93 + Math.random() * 5 : 0,
              currentOutput: Math.random() > 0.1 ? Math.round(currentGeneration * 0.25 * 10) / 10 : 0,
              maxOutput: 12,
            },
          ],
        }
      })

      // Remote Device Control
      this.get('/devices', (schema: any) => {
        const zones = schema.db.zones
        const devices: any[] = []
        
        zones.forEach((zone: any, index: number) => {
          // Compressors
          devices.push({
            id: `comp-${zone.id}`,
            name: `Máy nén ${zone.nameVi}`,
            type: 'COMPRESSOR',
            zone: zone.nameVi,
            zoneId: zone.id,
            status: 'ON',
            power: 15 + Math.random() * 5,
            temperature: zone.tempTarget,
            lastUpdated: new Date().toISOString(),
          })

          // Fans
          devices.push({
            id: `fan-${zone.id}`,
            name: `Quạt ${zone.nameVi}`,
            type: 'FAN',
            zone: zone.nameVi,
            zoneId: zone.id,
            status: 'ON',
            power: 2 + Math.random() * 1,
            speed: 75,
            lastUpdated: new Date().toISOString(),
          })

          // Lights (every other zone)
          if (index % 2 === 0) {
            devices.push({
              id: `light-${zone.id}`,
              name: `Đèn ${zone.nameVi}`,
              type: 'LIGHT',
              zone: zone.nameVi,
              zoneId: zone.id,
              status: 'OFF',
              power: 0,
              brightness: 0,
              lastUpdated: new Date().toISOString(),
            })
          }

          // Doors
          devices.push({
            id: `door-${zone.id}`,
            name: `Cửa ${zone.nameVi}`,
            type: 'DOOR',
            zone: zone.nameVi,
            zoneId: zone.id,
            status: 'OFF',
            power: 0.5,
            lastUpdated: new Date().toISOString(),
          })
        })

        // Add some heaters
        devices.push({
          id: 'heater-1',
          name: 'Máy sưởi khu vực làm việc',
          type: 'HEATER',
          zone: 'Văn phòng',
          zoneId: 'office-1',
          status: 'OFF',
          power: 0,
          temperature: 22,
          lastUpdated: new Date().toISOString(),
        })

        return devices
      })

      this.post('/devices/:id/control', (schema: any, request) => {
        const attrs = JSON.parse(request.requestBody)
        const deviceId = request.params.id
        
        // Simulate device control response
        return {
          success: true,
          deviceId,
          action: attrs.action,
          value: attrs.value,
          timestamp: new Date().toISOString(),
        }
      })
    },
  })
}

// Real-time sensor simulation
function startSensorSimulation(server: ReturnType<typeof createServer>) {
  setInterval(() => {
    const sensors = server.db.sensors

    sensors.forEach((sensor: unknown) => {
      const zone = server.db.zones.find((sensor as { zoneId: string }).zoneId)
      if (!zone || (sensor as { type: string }).type !== 'TEMPERATURE') return

      // Simulate temperature fluctuation
      const target = (zone as { tempTarget: number }).tempTarget
      const variation = (Math.random() - 0.5) * 2 // ±1°C
      let newTemp = target + variation

      // Occasionally create excursions
      if (Math.random() > 0.95) {
        newTemp = target + (Math.random() > 0.5 ? 5 : -5)
      }

      const newStatus =
        newTemp < (zone as { tempMin: number }).tempMin || newTemp > (zone as { tempMax: number }).tempMax ? 'WARNING' : 'ONLINE'

      server.db.sensors.update((sensor as { id: string }).id, {
        currentValue: Number(newTemp.toFixed(1)),
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      })

      // Create alert if WARNING
      if (newStatus === 'WARNING') {
        const existingAlert = server.db.alerts.findBy({
          sensorId: (sensor as { id: string }).id,
          status: 'OPEN',
        })

        if (!existingAlert) {
          server.create('alert', {
            id: `alert-${Date.now()}`,
            type: newTemp > (zone as { tempMax: number }).tempMax ? 'TEMP_HIGH' : 'TEMP_LOW',
            severity: 'HIGH',
            title: 'Temperature Excursion',
            titleVi: 'Vượt ngưỡng nhiệt độ',
            message: `${(zone as { name: string }).name} temperature is ${newTemp.toFixed(1)}°C`,
            messageVi: `Nhiệt độ ${(zone as { nameVi: string }).nameVi} là ${newTemp.toFixed(1)}°C`,
            warehouseId: (zone as { warehouseId: string }).warehouseId,
            zoneId: (sensor as { zoneId: string }).zoneId,
            sensorId: (sensor as { id: string }).id,
            createdAt: new Date().toISOString(),
            status: 'OPEN',
          })
        }
      }
    })
  }, 5000) // Update every 5 seconds
}
