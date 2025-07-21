import { lazy } from "react";

// Dynamically import the route components
export const TermsOfService = lazy(() =>
  import("../TermsOfService").then((module) => ({
    default: module.TermsOfService,
  })),
);

export const PrivacyPolicy = lazy(() =>
  import("../PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  })),
);

export const Changelog = lazy(() =>
  import("../Changelog").then((module) => ({ default: module.Changelog })),
);

export const Feedback = lazy(() =>
  import("../feedback/Feedback").then((module) => ({
    default: module.Feedback,
  })),
);

export const Documentation = lazy(() =>
  import("../Documentation").then((module) => ({
    default: module.Documentation,
  })),
);
