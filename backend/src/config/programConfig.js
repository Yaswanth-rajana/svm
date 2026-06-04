export const PROGRAM_CONFIG = {
  "it-infrastructure": {
    title: "IT Infrastructure Engineering Roadmap",
    shortTitle: "IT Infrastructure",
    emailSubject: "🎉 Registration Confirmed - IT Infrastructure Engineering Roadmap",
    learningPoints: [
      "Understand what IT Infrastructure is and how it powers the modern world.",
      "Discover why this is a highly stable, AI-proof career path.",
      "Get insights into job opportunities and salary benchmarks."
    ]
  },

  "cloud-computing": {
    title: "Cloud Computing Engineering Roadmap",
    shortTitle: "Cloud Computing",
    emailSubject: "🎉 Registration Confirmed - Cloud Computing Engineering Roadmap",
    learningPoints: [
      "Master AWS, Microsoft Azure, and Google Cloud Platform.",
      "Understand cloud deployment models and enterprise architectures.",
      "Build hands-on cloud infrastructure projects.",
      "Prepare for Cloud Engineer interview opportunities."
    ]
  },

  "devops-engineering": {
    title: "DevOps Engineering Roadmap",
    shortTitle: "DevOps Engineering",
    emailSubject: "🎉 Registration Confirmed - DevOps Engineering Roadmap",
    learningPoints: [
      "Master CI/CD pipelines, Docker, Kubernetes, and IaC (Terraform).",
      "Understand software development lifecycles and automated testing.",
      "Build production-ready deployment workflows.",
      "Prepare for DevOps & Site Reliability Engineer (SRE) job roles."
    ]
  },

  "virtualization-engineering": {
    title: "Virtualization Engineering Roadmap",
    shortTitle: "Virtualization Engineering",
    emailSubject: "🎉 Registration Confirmed - Virtualization Engineering Roadmap",
    learningPoints: [
      "Master VMware vSphere, ESXi, and Microsoft Hyper-V.",
      "Configure virtualization clusters, resource allocation, and datastores.",
      "Implement high availability, fault tolerance, and load distribution.",
      "Design robust backup strategies and disaster recovery plans."
    ]
  }
};

export const getProgramConfig = (program) => {
  return PROGRAM_CONFIG[program] || PROGRAM_CONFIG["it-infrastructure"];
};
