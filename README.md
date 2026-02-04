# POS System - Point of Sale

A complete Point of Sale system with React frontend and Spring Boot backend.

## Features

- ✅ **Barcode Scanning** - Scan products to add to cart
- ✅ **Session Management** - Open/close cashier sessions
- ✅ **Buy One Get One (BOGO)** - Loyalty program support
- ✅ **Discounts & Promotions** - Percentage or fixed amount discounts
- ✅ **Tax Calculation** - Per-product tax rates
- ✅ **Excel Import** - Import products and loyalty programs
- ✅ **Order History** - Track all orders per session

## Tech Stack

- **Frontend**: React 18
- **Backend**: Spring Boot 3.2
- **Database**: MySQL (H2 for development)
- **Excel Processing**: Apache POI

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+ (optional, H2 is used by default)

### Backend Setup

```bash
cd backend

# Run with H2 database (development)
./mvnw spring-boot:run

# Or with Maven
mvn spring-boot:run
```

The backend will start at `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will start at `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/barcode/{barcode}` - Get product by barcode
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/import` - Import from Excel

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/open` - Get open sessions
- `POST /api/sessions/open` - Open new session
- `POST /api/sessions/{id}/close` - Close session

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders/session/{sessionId}` - Get orders by session
- `POST /api/orders` - Create order

### Loyalty Programs
- `GET /api/loyalty` - Get all loyalty programs
- `GET /api/loyalty/active` - Get active programs
- `POST /api/loyalty` - Create loyalty program
- `POST /api/loyalty/import` - Import from Excel

### Promotions
- `GET /api/promotions` - Get all promotions
- `GET /api/promotions/active` - Get active promotions
- `POST /api/promotions` - Create promotion

## Excel Import Format

### Products (products.xlsx)

| Barcode | Name | Description | Price | Stock | Category | TaxRate |
|---------|------|-------------|-------|-------|----------|---------|
| 123456 | Coffee | Hot Coffee | 3.99 | 100 | Beverages | 0.08 |
| 234567 | Sandwich | Ham Sandwich | 5.99 | 50 | Food | 0.08 |

### Loyalty Programs (loyalty.xlsx)

| Name | Type | BuyQty | FreeQty | DiscountPercent | ProductBarcode | Category | StartDate | EndDate |
|------|------|--------|---------|-----------------|----------------|----------|-----------|---------|
| Buy 2 Get 1 Free Coffee | BOGO | 2 | 1 | 0 | 123456 | | 2024-01-01 00:00:00 | 2024-12-31 23:59:59 |
| 10% Off All Food | DISCOUNT | 0 | 0 | 10 | | Food | 2024-01-01 00:00:00 | 2024-12-31 23:59:59 |

## MySQL Configuration

To use MySQL instead of H2, update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pos_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

Create the database:

```sql
CREATE DATABASE pos_db;
```

## Usage

1. **Open Session**: Enter your name and opening cash amount
2. **Scan Products**: Type barcode or click product buttons
3. **Apply Promotions**: Promotions are automatically applied
4. **Checkout**: Select payment method (Cash/Card)
5. **Close Session**: End your shift and view sales summary

## License

MIT License
