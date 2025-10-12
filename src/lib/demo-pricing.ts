// Demo pricing data for testing when sandbox doesn't provide real pricing
export const DEMO_PRICING_DATA = {
  "01RW10": {
    pricing: {
      customerPrice: 299.99,
      retailPrice: 399.99,
      mapPrice: 349.99,
      currencyCode: "USD"
    },
    availability: {
      available: true,
      totalAvailability: 15,
      availabilityByWarehouse: [
        {
          quantityAvailable: 10,
          warehouseId: "WH001",
          location: "California",
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        },
        {
          quantityAvailable: 5,
          warehouseId: "WH002", 
          location: "Texas",
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        }
      ]
    }
  },
  "01RW18": {
    pricing: {
      customerPrice: 199.99,
      retailPrice: 249.99,
      mapPrice: 219.99,
      currencyCode: "USD"
    },
    availability: {
      available: true,
      totalAvailability: 8,
      availabilityByWarehouse: [
        {
          quantityAvailable: 8,
          warehouseId: "WH001",
          location: "California", 
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        }
      ]
    }
  },
  // Add sample part numbers from curl request
  "123512": {
    pricing: {
      customerPrice: 149.99,
      retailPrice: 199.99,
      mapPrice: 169.99,
      currencyCode: "USD"
    },
    availability: {
      available: true,
      totalAvailability: 25,
      availabilityByWarehouse: [
        {
          quantityAvailable: 25,
          warehouseId: "WH001",
          location: "California",
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        }
      ]
    }
  },
  "QQ0202": {
    pricing: {
      customerPrice: 89.99,
      retailPrice: 119.99,
      mapPrice: 99.99,
      currencyCode: "USD"
    },
    availability: {
      available: true,
      totalAvailability: 42,
      availabilityByWarehouse: [
        {
          quantityAvailable: 30,
          warehouseId: "WH001",
          location: "California",
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        },
        {
          quantityAvailable: 12,
          warehouseId: "WH003",
          location: "New Jersey",
          quantityBackordered: 0,
          quantityBackorderedEta: "",
          quantityOnOrder: 0
        }
      ]
    }
  }
};

export function getDemoPricing(ingramPartNumber: string) {
  return DEMO_PRICING_DATA[ingramPartNumber as keyof typeof DEMO_PRICING_DATA] || null;
}

export function isDemoMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.USE_DEMO_PRICING === 'true';
}

