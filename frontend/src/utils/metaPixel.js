export const COURSE_PROGRAM_TO_NAME = {
  'cloud-computing': 'Cloud Engineer',
  'devops-engineering': 'DevOps Engineer',
  'virtualization-engineering': 'Virtualization Engineer',
  'server-engineering': 'Server Engineer',
  'storage-engineering': 'Storage Engineer',
  'backup-engineering': 'Backup Engineer',
};

export const COURSE_ROUTE_TO_NAME = {
  '/cloud-computing': 'Cloud Engineer',
  '/devops-engineering': 'DevOps Engineer',
  '/virtualization-engineering': 'Virtualization Engineer',
  '/server-engineering': 'Server Engineer',
  '/storage-engineering': 'Storage Engineer',
  '/backup-engineering': 'Backup Engineer',
};

export function trackMetaEvent(eventName, parameters = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.fbq !== "function") {
    console.warn(`Meta Pixel is not available. Event skipped: ${eventName}`);
    return;
  }

  window.fbq("track", eventName, parameters);
}

// Track course detail page view (ViewContent)
let lastViewContent = { program: null, timestamp: 0 };

export function trackCourseViewContent(program) {
  const courseName = COURSE_PROGRAM_TO_NAME[program];
  if (!courseName) return;

  const now = Date.now();
  // Prevent rapid duplicate fires (e.g., React Strict Mode double-invocation in development)
  if (lastViewContent.program === program && now - lastViewContent.timestamp < 500) {
    return;
  }
  lastViewContent = { program, timestamp: now };

  trackMetaEvent("ViewContent", {
    content_name: courseName,
    content_category: "Course",
    content_type: "product",
  });
}

// Track course card "Know More" button click (CourseButtonClick)
export function trackCourseButtonClick(route, title) {
  const courseName =
    COURSE_ROUTE_TO_NAME[route] ||
    (Object.values(COURSE_PROGRAM_TO_NAME).includes(title) ? title : null);

  if (!courseName || !route) return;

  trackMetaEvent("CourseButtonClick", {
    content_name: courseName,
    content_category: "Course",
    destination_url: route,
  });
}
