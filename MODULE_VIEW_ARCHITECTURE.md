# MODULE VIEW - HỆ THỐNG QUẢN LÝ DI SẢN VĂN HÓA VÀ DU LỊCH

## 1. GIỚI THIỆU

Module View thể hiện cấu trúc phân rã logic của hệ thống thành các module chính theo Layered Architecture Pattern. Mũi tên A → B có nghĩa "Module A sử dụng Module B".

---

## 2. MODULE VIEW DIAGRAM

```mermaid
graph TB
    PL[PRESENTATION LAYER<br/>React Frontend<br/>User & Admin UI]
    
    AE[APPLICATION ENTRY<br/>NestJS Backend<br/>AppModule]
    
    CD[CORE DOMAIN<br/>Timeline | Collection | Location<br/>Article | Gallery]
    
    SD[SUPPORTING DOMAIN<br/>Community | Image Comparison<br/>File Upload]
    
    GD[GENERIC DOMAIN<br/>User | Category | Admin]
    
    CC[CROSS-CUTTING<br/>Authentication & Authorization<br/>Validation | Exception Handling]
    
    INF[INFRASTRUCTURE<br/>Database | Redis Cache<br/>Media Service]

    PL --> AE
    AE --> CD
    AE --> SD
    AE --> GD
    
    CD --> INF
    SD --> INF
    GD --> INF
    
    CD -.-> CC
    SD -.-> CC
    GD -.-> CC
    CC --> INF

    style PL fill:#E3F2FD,stroke:#1976D2,stroke-width:3px
    style AE fill:#FFF3E0,stroke:#F57C00,stroke-width:3px
    style CD fill:#FFF9C4,stroke:#F9A825,stroke-width:3px
    style SD fill:#E8F5E9,stroke:#388E3C,stroke-width:3px
    style GD fill:#F3E5F5,stroke:#7B1FA2,stroke-width:3px
    style CC fill:#FCE4EC,stroke:#C2185B,stroke-width:3px
    style INF fill:#ECEFF1,stroke:#546E7A,stroke-width:3px
```

---

## 3. MÔ TẢ MODULE

**PRESENTATION LAYER**: Giao diện React (User pages, Admin dashboard, Routing, State management)

**APPLICATION ENTRY**: NestJS Backend orchestrates tất cả domain modules

**CORE DOMAIN**: Timeline (3 trụ cột), Collection, Location, Article, Gallery

**SUPPORTING DOMAIN**: Community (comments, likes), Image Comparison, File Upload

**GENERIC DOMAIN**: User (roles), Category, Admin Management

**CROSS-CUTTING**: Authentication (JWT, OAuth2), Validation (DTO), Exception Handling

**INFRASTRUCTURE**: Database (MySQL + TypeORM), Redis Cache, Media Service (microservice)

---

## 4. KẾT LUẬN

Hệ thống phân rã thành 7 module theo Layered Architecture với dependencies một chiều từ trên xuống. Core Domain quản lý nghiệp vụ di sản văn hóa, Supporting Domain hỗ trợ tương tác cộng đồng, Generic Domain tái sử dụng, Cross-cutting xuyên suốt, Infrastructure cung cấp dịch vụ hạ tầng.

**Tài liệu tham khảo:** Bass, L., Clements, P., & Kazman, R. (2021). *Software Architecture in Practice* (4th ed.). Addison-Wesley.
