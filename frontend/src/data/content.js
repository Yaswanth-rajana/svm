export const programsContent = {
  // IT Infrastructure Program Data
  infrastructure: {
    hero: {
      badge: "AI-Proof Job Roles",
      title: "Start Your Career in IT Infrastructure",
      subtitle: "Understand how IT Infrastructure actually works",
      addonBadge: "AI-Proof Career Path",
      ctaPrimary: "Download Pdf",
      stats: [
        { text: "₹75 LPA + Avg Salary" },
        { text: "FDE Lab Partner" },
        { text: "Duration: 8 Months" }
      ],
      formHeader: "Limited seats — Register Now"
    },
    demand: {
      title: "Top IT Infrastructure Job Roles",
      subtitle: "Explore high-demand roles with strong career growth.",
      jobRoles: [
        {
          title: "Cloud Engineer",
          description: "Manage and oversee cloud-based systems and services.",
          salary: "₹10-15 LPA",
          route: "/cloud-computing"
        },
        {
          title: "DevOps Engineer",
          description: "Design, implement, and maintain computer networks.",
          salary: "₹8-15 LPA",
          comingSoon: true
        },
        {
          title: "Virtualization Engineer",
          description: "Bridge the gap between development and IT operations.",
          salary: "₹15-18 LPA",
          comingSoon: true
        },
        {
          title: "Server Engineer",
          description: "deploy, optimize, and support enterprise server infrastructure.",
          salary: "₹8-12 LPA",
          comingSoon: true
        },
        {
          title: "Storage Engineer",
          description: "Manages and maintains enterprise storage systems to ensure data availability.",
          salary: "₹10-12 LPA"
        },
        {
          title: "Backup Engineer",
          description: "Protects and restores business data through backup and disaster recovery solutions.",
          salary: "₹12-15 LPA"
        }
      ]
    },
    infrastructure: {
      title: "What is IT Infrastructure?",
      description: "IT Infrastructure refers to the combination of hardware, software, networks, and services that support the operation of modern digital systems. It enables businesses to store data, run applications, and deliver services efficiently.",
      highlights: [
        "Hardware (Servers, Storage)",
        "Software (Operating Systems, Applications)",
        "Networks (Connectivity & Communication)",
        "Cloud & Security"
      ],
      image: "/InfraImage.png"
    },
    infraTypes: {
      title: "Let's understand IT Infrastructure",
      types: [
        { name: "On-Prem", description: "Traditional in-house data centers" },
        { name: "Cloud", description: "AWS, Azure, Google Cloud platforms" },
        { name: "Hybrid", description: "Combination of on-prem and cloud systems" }
      ]
    },
    components: {
      title: "Key Components That Power IT Infrastructure",
      subtitle: "Core technologies that power modern IT systems",
      items: [
        { name: "Hardware", description: "Servers, storage & computing devices", icon: "Monitor" },
        { name: "Cloud", description: "On-demand scalable infrastructure", icon: "Cloud" },
        { name: "Software", description: "Operating systems, tools, and applications", icon: "Package" },
        { name: "Security", description: "Protecting data, networks, and systems", icon: "ShieldCheck" },
        { name: "Networks", description: "Seamless connectivity and communication", icon: "Network" },
        { name: "IaaS", description: "Infrastructure delivered as a service", icon: "Cpu" },
        { name: "Data Centers", description: "Secure facilities for computing resources", icon: "Database" },
        { name: "ITSM", description: "IT service management & operations", icon: "Wrench" }
      ]
    },
    whyBusiness: {
      title: "Why Businesses Need Modern IT Infrastructure",
      reasons: [
        { title: "Scalability", description: "Easily scale systems as business demand grows", icon: "TrendingUp" },
        { title: "Security", description: "Protect data, networks, and infrastructure from threats", icon: "Shield" },
        { title: "Cost Efficiency", description: "Reduce costs with optimized and scalable infrastructure", icon: "Zap" },
        { title: "Business Continuity", description: "Ensure uptime and reliable disaster recovery", icon: "Activity" }
      ]
    },
    jobRoles: {
      title: "Job Roles and Payscale in IT Infrastructure",
      subtitle: "Based on industry averages across India and global markets",
      roles: [
        { name: "Cloud Engineer", india: "₹10–15 LPA", global: "$70k–$120k", tag: "Core Role", icon: "🌐" },
        { name: "DevOps Engineer", india: "₹8–15 LPA", global: "$90k–$140k", tag: "High Demand", icon: "☁️" },
        { name: "Virtualization Engineer", india: "₹15–18 LPA", global: "$110k–$160k", tag: "Mid–Senior", icon: "⚙️" },
        { name: "Server Engineer", india: "₹8–12 LPA", global: "$90k–$150k", tag: "High Demand", icon: "🔒" },
        { name: "Storage Engineer", india: "₹10–12 LPA", global: "$60k–$100k", tag: "Entry Level", icon: "🖥️" },
        { name: "Backup Engineer", india: "₹12–15 LPA", global: "$120k–$180k", tag: "Specialized", icon: "🧩" }
      ]
    },
    roadmap: {
      title: "How You Can Start or Switch Your Career into IT Infra",
      subtitle: "A clear roadmap to become an IT Infra Engineer",
      steps: [
        {
          title: "Understand the IT Infrastructure",
          duration: "2–4 Weeks",
          description: "IT Infrastructure includes:",
          tags: ["Servers", "Virtualization", "Storage", "Backup & Disaster Recovery", "Cloud Platforms", "Networking & Security"]
        },
        {
          title: "Build Basic IT Foundation",
          duration: "4–8 Weeks",
          description: "Start with core fundamentals:",
          tags: ["Computer Hardware & OS basics", "Windows & Linux fundamentals", "Networking basics (IP, DNS, VLAN, Routing)", "Active Directory concepts"]
        },
        {
          title: "Learn Server Administration",
          duration: "4–8 Weeks",
          description: "Core skills every Infra Engineer must know:",
          tags: ["Windows Server installation & configuration", "Active Directory & Group Policy", "User & Access Management", "File Servers & Permissions", "System monitoring & troubleshooting"]
        },
        {
          title: "Learn Virtualization",
          duration: "8–12 Weeks",
          description: "This is where real IT Infra careers begin.",
          tags: ["Hypervisor concepts", "Virtual Machine deployment", "Resource allocation", "High Availability & Failover", "Snapshot & VM management"]
        },
        {
          title: "Learn Storage & Backup",
          duration: "8–12 Weeks",
          description: "Enterprise companies highly value this skill.",
          tags: ["SAN & NAS storage concepts", "RAID & Datastore management", "Backup strategies", "Disaster Recovery planning", "Data protection concepts"]
        },
        {
          title: "Add Cloud Skills",
          duration: "8–12 Weeks",
          description: "Modern Infra = On-Prem + Cloud",
          tags: ["Cloud Fundamentals", "Virtual machines in cloud", "Storage & networking in cloud", "Identity & access management", "Hybrid infrastructure"]
        },
        {
          title: "Learn Automation",
          duration: "8–12 Weeks",
          description: "This step separates average engineers from high-paid engineers.",
          tags: ["PowerShell or Python basics", "Infrastructure automation", "Monitoring & reporting automation"]
        },
        {
          title: "Build Hands-On Lab",
          duration: "Hands-on",
          description: "Create: ",
          tags: ["Home lab using virtualization", "Practice server deployment", "Simulate real company environment"]
        },
        {
          title: "Gain Experience",
          duration: "Flexible",
          description: "You can start by:",
          tags: ["Internships", "Freelance IT support", "Helping small businesses", "Personal infrastructure projects"]
        },
        {
          title: "Target Job Roles",
          duration: "Career",
          description: "Start applying for:",
          tags: ["IT Support Engineer", "System Administrator", "Cloud Engineer", "Data Centre Engineer", "Infrastructure Engineer"]
        }
      ]
    },
    mentors: {
      title: "Meet Your Mentor",
      subtitle: "Learn from experts who design enterprise-grade systems",
      list: [
        {
          name: "Saurabh Singh",
          role: "Senior IT Engineer",
          credibility: "10+ Years Experience in Enterprise Systems",
          linkedin: "https://www.linkedin.com/in/saurabh-singh-storage-admin/",
          photo: "Saurabh singh.jpg"
        }
      ]
    },
    webinar: {
      title: "🚀 Join Our Live Webinar",
      subtitle: "Learn IT Infrastructure from Industry Experts",
      dateTime: "📅 June 20  |  ⏰ 10:00 AM IST  |  ⏳ 90 mins",
      cta: "Claim Your Spot",
      trustLine: "Hurry Up, Seats are limited",
      urgencyLine: "Limited seats available – Filling fast!",
      socialProof: "100+ Professionals already registered",
      alreadyJoined: "Professionals already registered",
      benefits: [
        "Understand what is IT Infrastructure and how it works",
        "Know how this is an AI-Proof Career Path",
        "Job opportunities & salaries in IT Infrastructure Domain"
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "We have already answered your queries here",
      questions: [
        {
          question: "What is IT Infrastructure?",
          answer: "IT Infrastructure refers to the systems that run business technology, including servers, virtualization, storage, backup solutions, cloud platforms, networking, and data centres."
        },
        {
          question: "What job roles are available in IT Infrastructure?",
          answer: "Common IT Infra roles include:",
          list: [
            "System Administrator",
            "Server Engineer",
            "Virtualization Engineer",
            "Storage Engineer",
            "Backup & Disaster Recovery Engineer",
            "Cloud Infrastructure Engineer",
            "Data Centre Engineer",
            "DevOps / Platform Engineer"
          ]
        },
        {
          question: "Is IT Infrastructure a good career in 2026 and beyond?",
          answer: "Yes. Every organization depends on IT systems, cloud platforms, and data centres. Demand for skilled infrastructure engineers continues to grow with cloud computing, AI, and digital transformation."
        },
        {
          question: "Do I need coding skills to start an IT Infrastructure career?",
          answer: "No. Programming is not mandatory at the beginning. Basic scripting and automation skills can be learned later for faster career growth."
        },
        {
          question: "Can non-IT or career switchers enter IT Infrastructure?",
          answer: "Absolutely. Many professionals from non-IT backgrounds successfully transition into IT Infrastructure by learning fundamentals and gaining hands-on practical experience."
        },
        {
          question: "What is the salary range in IT Infrastructure roles?",
          answer: "Salary depends on skills and experience:",
          list: [
            "Entry Level: ₹3–6 LPA",
            "Mid-Level: ₹8–18 LPA",
            "Senior / Cloud Engineers: ₹20+ LPA"
          ]
        },
        {
          question: "Which skills are most in demand for IT Infrastructure jobs?",
          answer: "High-demand skills include:",
          list: [
            "Server Administration",
            "Virtualization",
            "Cloud Infrastructure",
            "Storage & Backup",
            "Automation & Monitoring",
            "Disaster Recovery Planning"
          ]
        },
        {
          question: "How long does it take to become job-ready in IT Infrastructure?",
          answer: "With structured learning and hands-on practice, most candidates become job-ready within 6–9 months."
        },
        {
          question: "What career growth opportunities exist in IT Infrastructure?",
          answer: "Career progression typically follows:\nIT Support → System Administrator → Virtualization/Cloud Engineer → Infrastructure Architect → IT Consultant or Cloud Specialist."
        },
        {
          question: "Are certifications required for IT Infrastructure jobs?",
          answer: "Certifications help to get into interviews but practical skills matter more. Real-world lab experience and problem-solving ability significantly improve job opportunities."
        }
      ]
    }
  },

  // Cloud Computing Program Data
  'cloud-computing': {
    hero: {
      badge: "AI-Proof Cloud Roles",
      title: "Become a Cloud Engineer & Build the Future of IT",
      subtitle: "Cloud adoption is booming worldwide, making Cloud Engineering one of the most in-demand careers today.",
      addonBadge: "AI-Proof Career Path",
      ctaPrimary: "Connect With Trainer",
      stats: [
        { text: "₹15 LPA + Avg Salary" },
        { text: "Cloud Lab Partner" },
        { text: "Duration: 8 Months" }
      ],
      formHeader: "Limited seats — Register Now"
    },
    demand: {
      title: "Top Cloud Computing Job Roles",
      subtitle: "Explore high-demand roles with strong career growth.",
      jobRoles: [
        {
          title: "Cloud Infrastructure Engineer",
          description: "Design, build, and oversee highly scalable and secure cloud environments.",
          salary: "₹8-12 LPA"
        },
        {
          title: "DevOps & Cloud Engineer",
          description: "Automate build-deploy pipelines and manage cloud operations at scale.",
          salary: "₹10-16 LPA"
        },
        {
          title: "Cloud Security Specialist",
          description: "Protect cloud assets, configure permissions, and enforce data encryption.",
          salary: "₹12-18 LPA"
        },
        {
          title: "Solutions Architect",
          description: "Design high-availability architectures and optimize cloud expenditures.",
          salary: "₹18-25 LPA"
        },
        {
          title: "SysOps Administrator",
          description: "Monitor cloud performance, handle logs, and manage system resources.",
          salary: "₹7-11 LPA"
        },
        {
          title: "Site Reliability Engineer (SRE)",
          description: "Keep cloud systems reliable, scalable, and operating at maximum efficiency.",
          salary: "₹14-22 LPA"
        }
      ]
    },
    infrastructure: {
      title: "What is Cloud Engineer ?",
      description: "A Cloud Engineer helps organizations build scalable, secure, and cost-efficient IT environments. They design, deploy, manage, and secure cloud infrastructure platforms such as",
      highlights: [
        "Amazon Web Services (AWS)",
        "Microsoft Azure",
        "Google Cloud (GCP)",
        "Identity & Access Management",
        "Cloud Monitoring & Security"
      ],
      image: "/cloud.png"
    },
    infraTypes: {
      title: "Top Cloud Platforms You Should Master",
      subtitle: "Gain hands-on experience with the world's leading cloud platforms used by top organizations worldwide.",
      types: [
        {
          name: "Amazon Web Services (AWS)",
          badge: "🔥 Most In-Demand",
          description: "Master EC2, S3, VPC, IAM, Route53, Load Balancers, Auto Scaling, and cloud deployment best practices.",
          tags: ["EC2", "S3", "VPC", "IAM"],
          stat: "31% Global Cloud Market Share",
          icon: "AWS",
          accentColor: "from-[#FF9900] to-[#FFC400]",
          glowColor: "rgba(255, 153, 0, 0.08)"
        },
        {
          name: "Microsoft Azure",
          badge: "🏢 Enterprise Favorite",
          description: "Learn Azure Virtual Machines, Storage Accounts, Azure Networking, Active Directory, Monitoring, and Security.",
          tags: ["VMs", "Storage", "Networking", "Security"],
          stat: "Preferred by Large Enterprises",
          icon: "Azure",
          accentColor: "from-[#0089D6] to-[#00BCF2]",
          glowColor: "rgba(0, 137, 214, 0.08)"
        },
        {
          name: "Google Cloud Platform (GCP)",
          badge: "🚀 Fastest Growing",
          description: "Work with Compute Engine, Cloud Storage, Kubernetes Engine, Identity Management, and cloud-native services.",
          tags: ["Compute Engine", "Kubernetes", "Cloud Storage", "IAM"],
          stat: "Rapidly Growing Adoption",
          icon: "GCP",
          accentColor: "from-[#4285F4] to-[#34A853]",
          glowColor: "rgba(66, 133, 244, 0.08)"
        }
      ]
    },
    components: {
      title: "How We Help You To Succeed",
      subtitle: "We focus on practical cloud learning instead of theoretical training.",
      differentTitle: "What Makes Us Different?",
      items: [
        { name: "Industry-Oriented Curriculum", description: "Learn with a curriculum designed in partnership with cloud experts to meet current market demands.", icon: "Award" },
        { name: "Real-World Cloud Deployment Scenarios", description: "Deploy architectures that simulate actual production issues, scaling challenges, and high-availability setups.", icon: "Globe" },
        { name: "Hands-On Lab Environment", description: "Access state-of-the-art sandboxes and live AWS/Azure consoles to build real solutions.", icon: "Terminal" },
        { name: "Career Roadmap Guidance", description: "Receive personalized career mapping and guidance to transition smoothly from your current role.", icon: "Layers" },
        { name: "Live Practical Demonstrations", description: "Watch live step-by-step walkthroughs of complex cloud configurations and troubleshooting.", icon: "Activity" },
        { name: "Interview Preparation & Mentorship", description: "Get resume reviews, mock interviews, and direct feedback from seasoned industry mentors.", icon: "Users" },
        { name: "Enterprise IT Infrastructure Exposure", description: "Gain hands-on familiarity with physical hardware, networking components, and enterprise servers alongside cloud configurations.", icon: "Server" }
      ],
      highlights: [
        "Lab Setup for Training",
        "Real-World Cloud Projects",
        "Resume Building Support",
        "Mock Interviews",
        "Industry Mentorship",
        "Career Guidance",
        "Placement-Oriented Learning",
        "Enterprise Infrastructure Exposure"
      ]
    },
    whyBusiness: {
      title: "Why Cloud Engineers Are in High Demand",
      subtitle: "Organizations are actively hiring professionals with practical cloud administration and deployment skills.",
      reasons: [
        { title: "Rapid Cloud Adoption", description: "Companies globally are migrating to the cloud to achieve unprecedented scale and agility.", icon: "TrendingUp" },
        { title: "Hybrid & Multi-Cloud", description: "Businesses rely on multi-cloud strategies, requiring engineers to bridge different platforms.", icon: "Globe" },
        { title: "Digital Transformation", description: "Modernizing application architectures with automation is a top priority across industries.", icon: "Zap" },
        { title: "Cloud Security", description: "Growing complexity makes securing cloud infrastructure and data a critical necessity.", icon: "Shield" }
      ]
    },
    jobRoles: {
      title: "Job Roles and Payscale in Cloud Computing",
      subtitle: "Based on industry averages for cloud professionals across India.",
      tiers: [
        {
          badge: "Entry Level",
          title: "Fresher",
          salary: "₹4 – ₹8 LPA",
          subtitle: "Start your career as a trainee or associate cloud administrator.",
          roles: ["Cloud Support Associate", "SysOps Trainee", "Junior DevOps Engineer"],
          accent: "from-[#ff0080] via-[#7928ca] to-[#ff4d4d]"
        },
        {
          badge: "Mid Career",
          title: "Mid-Level Professionals",
          salary: "₹8 – ₹18 LPA",
          subtitle: "Design and implement cloud environments and automation workflows.",
          roles: ["Cloud Engineer", "DevOps Engineer", "Cloud Security Analyst"],
          accent: "from-[#ff0080] via-[#7928ca] to-[#ff4d4d]"
        },
        {
          badge: "Senior / Expert",
          title: "Experienced Cloud Engineers",
          salary: "₹18 LPA – ₹35+ LPA",
          subtitle: "Architect enterprise systems, optimize costs, and lead migrations.",
          roles: ["Cloud Solutions Architect", "Site Reliability Engineer (SRE)", "Infrastructure Lead"],
          accent: "from-[#ff0080] via-[#7928ca] to-[#ff4d4d]"
        }
      ]
    },
    roadmap: {
      title: "Complete Roadmap to Become a Cloud Engineer",
      subtitle: "A step-by-step journey from IT fundamentals to cloud automation and infrastructure management.",
      steps: [
        {
          phase: "🚀 Phase 1",
          title: "IT Fundamentals",
          description: "Build a strong technical foundation before entering cloud technologies.",
          tags: [
            "Computer Hardware Basics",
            "Operating Systems",
            "Windows Fundamentals",
            "Linux Fundamentals",
            "IP Addressing",
            "DNS",
            "DHCP",
            "Routing",
            "Switching"
          ]
        },
        {
          phase: "🏢 Phase 2",
          title: "Server Administration",
          description: "Learn how enterprise servers and users are managed in production environments.",
          tags: [
            "Windows Server Administration",
            "Active Directory",
            "Group Policies",
            "User Management",
            "Linux Administration",
            "File & Permission Management"
          ]
        },
        {
          phase: "🖥️ Phase 3",
          title: "Virtualization",
          description: "Understand how modern data centres operate before moving to cloud.",
          tags: [
            "VMware ESXi",
            "vCenter",
            "Hyper-V",
            "Virtual Machines",
            "Resource Allocation",
            "High Availability Concepts"
          ]
        },
        {
          phase: "☁️ Phase 4",
          title: "Cloud Fundamentals",
          description: "Learn major cloud platforms and their core infrastructure services.",
          tags: [
            "Amazon Web Services (AWS)",
            "Microsoft Azure",
            "Google Cloud Platform (GCP)",
            "Compute Services",
            "Virtual Machines",
            "Storage Services",
            "Networking Services",
            "Identity & Access Management"
          ]
        },
        {
          phase: "⚙️ Phase 5",
          title: "Cloud Administration",
          description: "Manage and maintain cloud environments used by organizations.",
          tags: [
            "Virtual Networks",
            "Security Groups",
            "Load Balancers",
            "Monitoring",
            "Backup Services",
            "Disaster Recovery"
          ]
        },
        {
          phase: "🤖 Phase 6",
          title: "Automation & Infrastructure as Code",
          description: "Become a modern cloud engineer through automation and infrastructure provisioning.",
          tags: [
            "PowerShell",
            "Python Basics",
            "Terraform",
            "Cloud Automation"
          ]
        }
      ],
      outcome: {
        title: "🎯 Outcome After Completion",
        subtitle: "You will be ready for roles such as:",
        roles: [
          "Cloud Engineer",
          "AWS Administrator",
          "Azure Administrator",
          "Cloud Operations Engineer",
          "Infrastructure Engineer",
          "Cloud Support Engineer"
        ],
        salaryLabel: "Expected Salary Range:",
        salaryValue: "₹8 LPA – ₹15+ LPA"
      }
    },
    mentors: {
      title: "Meet Your Mentor",
      subtitle: "Learn from experts who design and run enterprise-grade cloud systems",
      list: [
        {
          name: "Saurabh Singh",
          role: "Senior IT & Cloud Architect",
          credibility: "10+ Years Experience in Enterprise & Cloud Infrastructure",
          linkedin: "https://www.linkedin.com/in/saurabh-singh-storage-admin/",
          photo: "Saurabh singh.jpg"
        }
      ]
    },
    webinar: {
      title: "🚀 Join Our Live Cloud Masterclass",
      subtitle: "Learn Cloud Engineering from Industry Experts",
      dateTime: "📅 June 20  |  ⏰ 10:00 AM IST  |  ⏳ 90 mins",
      cta: "Claim Your Spot",
      trustLine: "Hurry Up, Seats are limited",
      urgencyLine: "Limited seats available – Filling fast!",
      socialProof: "150+ Professionals already registered",
      alreadyJoined: "Professionals already registered",
      benefits: [
        "Understand cloud architecture patterns and how they work",
        "Know why Cloud Engineering is highly resistant to AI",
        "Explore job opportunities and career transition strategies"
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about the Cloud Engineering training.",
      questions: [
        {
          question: "What is Cloud Computing?",
          answer: "Cloud Computing is the delivery of computing services—including servers, storage, databases, networking, software, and analytics—over the internet to offer faster innovation, flexible resources, and economies of scale."
        },
        {
          question: "Is this training suitable for beginners?",
          answer: "Yes! Our curriculum is designed to take you from a basic IT understanding to an advanced, industry-ready Cloud Engineering skillset, starting with foundational operating systems and networking."
        },
        {
          question: "Do I need coding/programming skills to start?",
          answer: "No. You do not need strong programming skills to start a career in cloud engineering. Basic scripting (like PowerShell or Bash) is taught as part of the curriculum for automations, but no heavy software development is required."
        },
        {
          question: "What certification exams will this help me prepare for?",
          answer: "The curriculum helps prepare you for major entry-to-associate level cloud certifications, such as AWS Certified Solutions Architect - Associate and Microsoft Certified: Azure Administrator Associate."
        },
        {
          question: "What is the job demand and salary projection for Cloud Engineers?",
          answer: "Cloud Engineering is one of the fastest-growing fields in tech. Certified professionals in India typically earn in the range of ₹8–15 LPA at mid-level, with senior architects and SREs earning upwards of ₹20–25+ LPA."
        },
        {
          question: "Will I get hands-on lab experience?",
          answer: "Yes! You will work on real-world hands-on cloud labs on AWS and Azure, simulating enterprise deployments, hybrid networking, storage syncs, and auto-scaling setups."
        }
      ]
    }
  }
};

export const content = programsContent.infrastructure;