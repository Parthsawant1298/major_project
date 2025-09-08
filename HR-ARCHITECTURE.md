# HR/Host Side Architecture Diagram

## System Architecture

```mermaid
graph TB
    %% User Layer
    subgraph "👤 HR/Host User Interface"
        A[HR Dashboard] 
        B[Job Management]
        C[Candidate Management]
        D[Analytics & Reports]
        E[Profile Management]
    end

    %% Application Layer
    subgraph "🖥️ Next.js App Layer"
        F[Host Pages]
        G[API Routes]
        H[Components]
        I[Middleware]
    end

    %% Services Layer
    subgraph "⚙️ Service Layer"
        J[Authentication Service]
        K[AI Services]
        L[VAPI Service]
        M[Email Service]
        N[File Upload Service]
    end

    %% External APIs
    subgraph "🌐 External Services"
        O[OpenAI/OpenRouter]
        P[VAPI AI]
        Q[Cloudinary]
        R[MongoDB Atlas]
        S[Email Provider]
    end

    %% Data Models
    subgraph "📊 Data Models"
        T[Host Model]
        U[Job Model]
        V[Application Model]
        W[User Model]
    end

    %% Connections
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F

    F --> G
    F --> H
    F --> I

    G --> J
    G --> K
    G --> L
    G --> M
    G --> N

    J --> T
    J --> R
    
    K --> O
    K --> U
    K --> V
    
    L --> P
    L --> U
    L --> V
    
    M --> S
    
    N --> Q
    
    G --> T
    G --> U
    G --> V
    G --> W

    T --> R
    U --> R
    V --> R
    W --> R

    %% Styling
    classDef userLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef appLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef serviceLayer fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef externalLayer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dataLayer fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class A,B,C,D,E userLayer
    class F,G,H,I appLayer
    class J,K,L,M,N serviceLayer
    class O,P,Q,R,S externalLayer
    class T,U,V,W dataLayer
```

## Detailed Component Architecture

```mermaid
graph TD
    %% Host Dashboard Flow
    subgraph "📋 HR Dashboard Workflow"
        A1[Login/Register] --> A2[Dashboard Overview]
        A2 --> A3[Job Statistics]
        A2 --> A4[Recent Activities]
        A2 --> A5[Quick Actions]
    end

    %% Job Management Flow
    subgraph "💼 Job Management Workflow"
        B1[Create Job] --> B2[Job Form]
        B2 --> B3[AI Question Generation]
        B3 --> B4[Job Publication]
        B4 --> B5[Job Monitoring]
        B5 --> B6[Job Analytics]
        
        B7[Job List] --> B8[Job Details]
        B8 --> B9[Edit Job]
        B8 --> B10[View Candidates]
        B8 --> B11[Job Status Management]
    end

    %% Candidate Management Flow
    subgraph "👥 Candidate Management Workflow"
        C1[Application Review] --> C2[Resume Analysis]
        C2 --> C3[ATS Scoring]
        C3 --> C4[Shortlisting]
        C4 --> C5[Interview Scheduling]
        C5 --> C6[Voice Interview]
        C6 --> C7[Interview Analysis]
        C7 --> C8[Final Selection]
        C8 --> C9[Offer Management]
    end

    %% AI Integration Flow
    subgraph "🤖 AI Service Integration"
        D1[Resume Upload] --> D2[Text Extraction]
        D2 --> D3[AI Analysis]
        D3 --> D4[Score Generation]
        
        D5[Question Generation] --> D6[OpenAI API]
        D6 --> D7[Question Validation]
        
        D8[Voice Interview] --> D9[VAPI Integration]
        D9 --> D10[Transcript Analysis]
        D10 --> D11[Performance Scoring]
    end

    %% Data Flow
    subgraph "📊 Data Management"
        E1[User Input] --> E2[Validation]
        E2 --> E3[Business Logic]
        E3 --> E4[Database Operations]
        E4 --> E5[Response Generation]
        
        E6[File Uploads] --> E7[Cloudinary Storage]
        E7 --> E8[URL Generation]
    end

    %% Connections between workflows
    A2 --> B1
    A2 --> B7
    B5 --> C1
    C2 --> D1
    C6 --> D8
    B3 --> D5
    
    %% Styling
    classDef dashboardFlow fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef jobFlow fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef candidateFlow fill:#fce4ec,stroke:#ad1457,stroke-width:2px
    classDef aiFlow fill:#fff8e1,stroke:#ff8f00,stroke-width:2px
    classDef dataFlow fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class A1,A2,A3,A4,A5 dashboardFlow
    class B1,B2,B3,B4,B5,B6,B7,B8,B9,B10,B11 jobFlow
    class C1,C2,C3,C4,C5,C6,C7,C8,C9 candidateFlow
    class D1,D2,D3,D4,D5,D6,D7,D8,D9,D10,D11 aiFlow
    class E1,E2,E3,E4,E5,E6,E7,E8 dataFlow
```

## API Architecture

```mermaid
graph LR
    %% Client Side
    subgraph "🌐 Client Side"
        A[Host Dashboard UI]
        B[Forms & Components]
        C[State Management]
    end

    %% API Layer
    subgraph "🔄 API Layer"
        D[Authentication APIs]
        E[Job Management APIs]
        F[Candidate APIs]
        G[Analytics APIs]
        H[File Upload APIs]
    end

    %% Business Logic
    subgraph "⚡ Business Logic"
        I[Host Authentication]
        J[Job CRUD Operations]
        K[Application Processing]
        L[AI Integration]
        M[Analytics Generation]
    end

    %% Database Layer
    subgraph "💾 Database Layer"
        N[Host Collection]
        O[Jobs Collection]
        P[Applications Collection]
        Q[Users Collection]
    end

    %% External Services
    subgraph "🛠️ External Services"
        R[OpenAI/OpenRouter]
        S[VAPI]
        T[Cloudinary]
        U[Email Service]
    end

    %% API Routes Details
    subgraph "📍 Host API Routes"
        D1[/api/host/auth/login]
        D2[/api/host/auth/register]
        D3[/api/host/auth/logout]
        
        E1[/api/host/jobs/create]
        E2[/api/host/jobs/list]
        E3[/api/host/jobs/[id]/edit]
        E4[/api/host/jobs/[id]/delete]
        E5[/api/host/jobs/[id]/analytics]
        
        F1[/api/host/jobs/[id]/candidates]
        F2[/api/host/jobs/[id]/candidates/shortlist]
        F3[/api/host/jobs/[id]/candidates/offer]
        
        H1[/api/host/update-profile-picture]
    end

    %% Connections
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    
    B --> D
    B --> E
    B --> F
    
    C --> D
    C --> E
    C --> F
    
    D --> I
    E --> J
    F --> K
    G --> M
    H --> K
    
    I --> N
    J --> O
    K --> P
    K --> Q
    M --> O
    M --> P
    
    L --> R
    L --> S
    K --> T
    I --> U
    
    D --> D1
    D --> D2
    D --> D3
    E --> E1
    E --> E2
    E --> E3
    E --> E4
    E --> E5
    F --> F1
    F --> F2
    F --> F3
    H --> H1

    %% Styling
    classDef clientLayer fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef apiLayer fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef businessLayer fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef dataLayer fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef externalLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef routeLayer fill:#f1f8e9,stroke:#388e3c,stroke-width:2px

    class A,B,C clientLayer
    class D,E,F,G,H apiLayer
    class I,J,K,L,M businessLayer
    class N,O,P,Q dataLayer
    class R,S,T,U externalLayer
    class D1,D2,D3,E1,E2,E3,E4,E5,F1,F2,F3,H1 routeLayer
```

## Database Schema

```mermaid
erDiagram
    Host {
        ObjectId _id
        String fullName
        String email
        String password
        String companyName
        String designation
        String profilePicture
        Date createdAt
        Date updatedAt
    }

    Job {
        ObjectId _id
        ObjectId hostId
        String jobTitle
        String jobDescription
        String jobResponsibilities
        String jobRequirements
        String jobType
        String jobImage
        Number maxCandidatesShortlist
        Number finalSelectionCount
        Number targetApplications
        Number voiceInterviewDuration
        Array interviewQuestions
        String status
        Number currentApplications
        Number completedInterviews
        Date createdAt
        Date updatedAt
    }

    Application {
        ObjectId _id
        ObjectId jobId
        ObjectId userId
        String resumeUrl
        String resumeText
        Object resumeAnalysis
        Number atsScore
        String status
        Boolean voiceInterviewCompleted
        Number voiceInterviewScore
        Object voiceInterviewFeedback
        Number finalScore
        Date appliedAt
        Date interviewCompletedAt
        Date updatedAt
    }

    User {
        ObjectId _id
        String fullName
        String email
        String password
        String profilePicture
        Date createdAt
        Date updatedAt
    }

    %% Relationships
    Host ||--o{ Job : creates
    Job ||--o{ Application : receives
    User ||--o{ Application : submits
```