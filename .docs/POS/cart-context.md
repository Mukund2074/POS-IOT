# 🛒 Cart OOP Architecture – Cheat Sheet

## 📌 Overview

This cart system is **domain-driven, OOP-based, high-performance**, and designed to handle **thousands of items** with complex discounts, taxes, and payment breakdowns without killing React performance.

It splits responsibilities into **focused classes** and uses **memoization + workers** for heavy calculations.

---

## 🔍 Data Flow Diagram

```mermaid
flowchart LR
  UI[React Components] --> Provider[CartProvider]
  Provider --> Cart[Cart (domain instance)]
  Cart --> Worker[CartWorker (Web Worker)]
  Cart --> Persistence[CartPersistence (IndexedDB)]
  Worker --> Calculator[CartCalculator]
  Calculator --> Breakdowns[Breakdown Classes]
  Worker --> Cart
  Persistence --> Cart
```

---

## 📂 File Structure & Roles

| File                                 | Role                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **services/CartService.ts**          | Helpers for adding/removing/updating items immutably.                                                    |
| **services/CartCalculator.ts**       | Pure functions for totals, taxes, and discounts.                                                         |
| **services/CartPaymentBreakdown.ts** | Computes payment distribution summary.                                                                   |
| **services/CartSalesBreakdown.ts**   | Computes sales breakdown by category/type.                                                               |
| **context/CartProvider.tsx**         | React bridge to the `Cart` domain class. Exposes state & methods to UI.                                  |
| **domain/Cart.ts**                   | The core domain object. Holds state (items, refunds, payments) and coordinates calculations/persistence. |
| **worker/cartWorker.ts**             | Runs heavy calculations off the main thread.                                                             |
| **tests/**                           | Unit tests for calculator, breakdowns, and service methods.                                              |

---

## ⚡ Typical Workflows

### 1. Add an Item

```ts
cartRef.current.addItem({
  productId: '123',
  quantity: 1,
  price: 100,
  discountAmount: 0,
  discountPercentage: 0,
});
cartRef.current.calculate(workerRef.current);
cartRef.current.save();
```

---

### 2. Apply a Discount

```ts
const index = 0; // item position
cartRef.current.updateItem(index, {
  ...snapshot.items[index],
  discountPercentage: 10,
});
cartRef.current.calculate(workerRef.current);
```

---

### 3. Remove an Item

```ts
cartRef.current.removeItem(index);
cartRef.current.calculate(workerRef.current);
cartRef.current.save();
```

---

## 🛠 Debugging Entry Points

| Task                         | Where to Start                                                    |
| ---------------------------- | ----------------------------------------------------------------- |
| Incorrect totals             | `CartCalculator.processItems()`                                   |
| Wrong payment breakdown      | `CartPaymentBreakdown.compute()`                                  |
| Wrong sales breakdown        | `CartSalesBreakdown.compute()`                                    |
| Item not appearing in cart   | `Cart.addItem()` and check provider calling it                    |
| UI not updating after change | Ensure provider subscribes to `cartRef.current.on('change', ...)` |

---

## 🧠 Key Concepts for New Devs

* **CartProvider** is the entry point for React.
* **Cart (domain class)** is the brain — owns state & coordinates calculations.
* **Worker** is for performance — heavy math happens here.
* **Persistence** keeps the cart alive after refresh.
* **Breakdown classes** are pure — safe to test in isolation.

---

## 📏 Performance & Safety Notes

* All updates are **immutable** → minimal React re-renders.
* Worker failover → if the worker fails, fallback to local calculation.
* Persistence is debounced to avoid overloading IndexedDB.
* Strong error handling: typed errors + safe runner in worker.
