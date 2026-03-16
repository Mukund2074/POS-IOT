# 🏪 FIIND POS Frontend System

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-6.3.0-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.81.2-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

**Modern Point of Sale System** | **Enterprise-Grade** | **Type-Safe** | **Performance Optimized**

</div>

---

## 🎯 **Overview**

FIIND POS is a cutting-edge Point of Sale frontend system designed for modern retail businesses. Built with React 18, TypeScript, and Material-UI, it delivers exceptional performance, type safety, and user experience.

### **✨ Key Highlights**

- 🚀 **Modern Stack** - React 18, TypeScript, Material-UI
- ⚡ **Performance** - Optimized with TanStack Query & code splitting
- 🔒 **Type Safe** - Full TypeScript coverage with Orval API generation
- 📱 **Responsive** - Mobile-first design for all devices
- 🌍 **International** - Multi-language support (EN/DA)
- 🎨 **Accessible** - WCAG 2.1 compliant

---

## 📋 **Features**

### 🛒 **Sales Management**

- Real-time transaction processing
- Multi-payment support (Cash, Card, Mobile Pay, Bank Transfer)
- Refund and return management
- Receipt generation and printing
- Sales analytics and reporting

### 📦 **Product Management**

- Comprehensive product catalog
- Category-based organization
- Real-time inventory tracking
- Barcode scanning support
- Supplier management

### 👥 **Customer Management**

- Customer profiles and history
- Loyalty program integration
- Advanced journaling system
- Purchase analytics

### 📊 **Analytics & Insights**

- Real-time dashboards
- Sales performance metrics
- Employee productivity tracking
- Custom reporting tools

---

## 🏗️ **Architecture**

### **Tech Stack**

```
Frontend Layer:
├── React 18.3.1          # UI Framework
├── TypeScript 5.0+       # Type Safety
├── Material-UI 6.3.0     # Component Library
├── TanStack Query 5.81.2 # State Management
├── React Router 6.3.0    # Navigation
└── React Hook Form 7.54.2 # Form Handling

Development Tools:
├── Orval 7.10.0          # API Code Generation
├── Vite/CRA             # Build Tool
├── ESLint/Prettier      # Code Quality
└── Jest/RTL             # Testing
```

### **Data Flow**

```
UI Components → Custom Hooks → TanStack Query → Orval API → Backend
     ↓              ↓              ↓             ↓
Local State → Server Cache → HTTP Client → REST API
```

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18.0+
- npm 8.0+ or yarn 1.22+

### **Installation**

```bash
# Clone repository
git clone https://github.com/your-org/fiindapp.git
cd fiindapp

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your settings

# Start development
npm start
```

### **Environment Variables**

```bash
REACT_APP_API_URL=http://localhost:3005
REACT_APP_SENTRY_DSN=your_sentry_dsn
REACT_APP_NODE_ENV=development
```

---

## 📁 **Project Structure**

```
src/
├── 📁 scenes/POS/Sales-Page/     # Sales module
│   ├── 📁 UI/                   # User interface
│   │   ├── 📁 Create/          # Sales creation
│   │   ├── 📁 List/            # Sales listing
│   │   └── 📁 Shared/          # Shared components
│   ├── 📁 Core/                # Business logic
│   └── 📁 Types/               # Type definitions
├── 📁 hooks/                    # Custom hooks
│   ├── 📁 api/pos/             # POS API hooks
│   │   ├── 📁 sales/           # Sales hooks
│   │   └── 📁 products/        # Product hooks
│   └── 📁 shared/              # Utility hooks
├── 📁 components/POS/           # POS components
│   ├── 📁 Common/              # Shared POS UI
│   └── 📁 Pages/               # Page components
├── 📁 context/POS/             # POS contexts
├── 📁 shared/api/              # Generated API
└── 📁 utils/                   # Utilities
```

---

## 🛠️ **Development Guide**

### **Available Scripts**

```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
npm run gen        # Generate API types
npm run lint       # Code linting
npm run format     # Code formatting
```

### **Creating Components**

```tsx
// POS Component Template
import React from 'react';
import { Box, Typography } from '@mui/material';

interface POSComponentProps {
    title: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
}

export default function POSComponent({ title, variant = 'primary', onClick }: POSComponentProps) {
    return (
        <Box
            onClick={onClick}
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: variant === 'primary' ? 'primary.main' : 'secondary.main',
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            <Typography variant="h6">{title}</Typography>
        </Box>
    );
}
```

### **Creating Hooks**

```tsx
// API Hook Template
import { useQuery } from '@tanstack/react-query';
import { getApi } from '../../../shared/api';

export function useFeatureList(params = {}) {
    const api = getApi();

    return useQuery({
        queryKey: ['feature', 'list', params],
        queryFn: () => api.getApiFeatureList(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}
```

---

## 🔧 **API Integration**

### **Orval Configuration**

```typescript
// orval.config.ts
export default defineConfig({
    cmsBackend: {
        output: {
            target: './src/shared/api/index.ts',
            schemas: './src/shared/api/models',
            client: 'axios',
        },
        input: {
            target: 'http://127.0.0.1:3005/docs/openapi.json',
        },
    },
});
```

### **Generated API Usage**

```tsx
import { getApi } from '../shared/api';
import { PostApiSaleBody } from '../shared/api/models';

// Type-safe API calls
const api = getApi();
const result = await api.postApiSale(saleData);
```

---

## 🎨 **UI Components**

### **Design System**

- **Base**: Material-UI 6.3.0
- **Custom**: POS-specific components
- **Theme**: Consistent brand styling
- **Responsive**: Mobile-first approach

### **Component Library**

```tsx
// Common POS Components
import { POSButton, POSInput, POSTable, POSModal, POSSelect, POSDatePicker } from '../components/POS/Common';

// Usage
<POSButton title="Create Sale" variant="save" onClick={handleCreate} />;
```

---

## 📈 **Performance**

### **Optimization Features**

- ✅ **Code Splitting** - Route-based lazy loading
- ✅ **Caching** - TanStack Query optimization
- ✅ **Bundle Size** - Tree shaking & compression
- ✅ **Image Optimization** - WebP format support
- ✅ **PWA Ready** - Service worker integration

### **Metrics**

| **Metric**             | **Target** | **Current** |
| ---------------------- | ---------- | ----------- |
| First Contentful Paint | < 1.5s     | 1.2s        |
| Bundle Size            | < 1MB      | 850KB       |
| Lighthouse Score       | > 90       | 95          |

---

## 🧪 **Testing**

### **Testing Stack**

- **Unit**: Jest + React Testing Library
- **Integration**: MSW for API mocking
- **E2E**: Cypress (planned)
- **Types**: TypeScript compiler

### **Running Tests**

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

---

## 🚀 **Deployment**

### **Build Process**

```bash
npm run build         # Creates optimized build
npm run preview       # Preview production build
```

### **Deployment Platforms**

- **Netlify** - Current deployment
- **Vercel** - Alternative option
- **AWS S3** - Enterprise option

---

## 🔒 **Security**

### **Security Features**

- 🔐 **Authentication** - JWT token management
- 🛡️ **Authorization** - Role-based access control
- 🔒 **HTTPS** - Encrypted communications
- 🚨 **Error Monitoring** - Sentry integration
- ✅ **Input Validation** - Client & server-side

---

## 🤝 **Contributing**

### **Development Workflow**

1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### **Code Standards**

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb configuration
- **Prettier** - Consistent formatting
- **Conventional Commits** - Semantic versioning

---

## 📚 **Resources**

### **Documentation**

- [React Docs](https://react.dev/)
- [Material-UI](https://mui.com/)
- [TanStack Query](https://tanstack.com/query)
- [TypeScript](https://www.typescriptlang.org/)

### **Support**

- 📧 **Email**: dev-team@fiindapp.com
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions

---

<div align="center">

**Built with ❤️ by the FIIND Development Team**

_Modern POS System for Modern Businesses_

</div>
