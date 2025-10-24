# Order Checkout Example Payloads

Use the sample values below when testing the cart checkout workflow against the Ingram Micro Canada APIs. The data satisfies the required header-level and address-level constraints that the sandbox enforces.

## Required Fields

| Field | Example Value | Notes |
| ----- | ------------- | ----- |
| `customerOrderNumber` | `PO-2025-0001` | Must be unique per submission unless `allowDuplicateCustomerOrderNumber` attribute is set to `true`. |
| `acceptBackOrder` | `true` | Optional; omit or set to `false` if backorders are not allowed. |

### Shipping Information (`shipToInfo`)

```json
{
  "companyName": "Tech Innovations Ltd.",
  "contact": "Jordan Blake",
  "addressLine1": "123 Innovation Way",
  "addressLine2": "Suite 400",
  "city": "Toronto",
  "state": "ON",
  "postalCode": "M5H 2N2",
  "countryCode": "CA",
  "phoneNumber": "4165551234",
  "email": "logistics@techinnovations.ca"
}
```

- `state` must be a two-letter province/state code when shipping to the United States or Canada.
- `countryCode` must be a two-letter ISO code (e.g., `CA`, `US`).
- `email` should be a valid address; the API rejects obvious placeholders.

### Optional End-User Information (`endUserInfo`)

Only include this block if the customer toggles “Add end-user shipment details” and provides the full address.

```json
{
  "companyName": "Northern Data Corp.",
  "contact": "Sasha Martinez",
  "addressLine1": "850 Market Street",
  "addressLine2": "Floor 9",
  "city": "Vancouver",
  "state": "BC",
  "postalCode": "V6B 1A1",
  "countryCode": "CA",
  "phoneNumber": "6045559876",
  "email": "itops@northerndata.ca"
}
```

> **Important:** Leave `endUserInfo` out of the payload entirely if the user does not supply all required fields. Sending an empty object triggers the Ingram validation error `"endUserInfo Object: Values under endUserInfo object cannot be empty."`

### Line Items (`lines`)

```json
[
  {
    "customerLineNumber": "1",
    "ingramPartNumber": "398A1T",
    "quantity": 2
  },
  {
    "customerLineNumber": "2",
    "ingramPartNumber": "524FFZ",
    "quantity": 1
  }
]
```

Each line requires a unique `customerLineNumber`, an `ingramPartNumber`, and a positive integer `quantity`.

### Additional Attributes

```json
[
  {
    "attributeName": "allowDuplicateCustomerOrderNumber",
    "attributeValue": "true"
  }
]
```

This attribute allows reuse of a `customerOrderNumber` while testing. Remove it in production if duplicates should be rejected.

## Full Example Request

```json
{
  "customerOrderNumber": "PO-2025-0001",
  "acceptBackOrder": "true",
  "shipToInfo": {
    "companyName": "Tech Innovations Ltd.",
    "contact": "Jordan Blake",
    "addressLine1": "123 Innovation Way",
    "addressLine2": "Suite 400",
    "city": "Toronto",
    "state": "ON",
    "postalCode": "M5H 2N2",
    "countryCode": "CA",
    "phoneNumber": "4165551234",
    "email": "logistics@techinnovations.ca"
  },
  "endCustomerOrderNumber": "END-CUST-7788",
  "endUserInfo": {
    "companyName": "Northern Data Corp.",
    "contact": "Sasha Martinez",
    "addressLine1": "850 Market Street",
    "addressLine2": "Floor 9",
    "city": "Vancouver",
    "state": "BC",
    "postalCode": "V6B 1A1",
    "countryCode": "CA",
    "phoneNumber": "6045559876",
    "email": "itops@northerndata.ca"
  },
  "lines": [
    {
      "customerLineNumber": "1",
      "ingramPartNumber": "398A1T",
      "quantity": 2
    },
    {
      "customerLineNumber": "2",
      "ingramPartNumber": "524FFZ",
      "quantity": 1
    }
  ],
  "additionalAttributes": [
    {
      "attributeName": "allowDuplicateCustomerOrderNumber",
      "attributeValue": "true"
    }
  ]
}
```

Use these examples to pre-populate the checkout form or to craft manual API calls while validating the integration. Adjust part numbers, quantities, or contact details as needed for your sandbox tenant. 
