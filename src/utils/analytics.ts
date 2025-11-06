// Google Analytics 4 Event Tracking
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

// Default Measurement ID (can be overridden by .env file)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MZZ88M6MGW';

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') {
    return;
  }

  // Initialize dataLayer
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  window.gtag = function() {
    if (window.dataLayer) {
      window.dataLayer.push(arguments);
    }
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
  });

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  eventParams?: {
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    node_id?: string;
    option_label?: string;
    [key: string]: any;
  }
) {
  if (!window.gtag || !GA_MEASUREMENT_ID) {
    // Log in development mode
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', eventName, eventParams);
    }
    return;
  }

  window.gtag('event', eventName, {
    ...eventParams,
  });
}

// Specific tracking functions for common events
export const analytics = {
  // Track when user starts the flow
  trackFlowStart: () => {
    trackEvent('flow_start', {
      category: 'beslisboom',
      action: 'start',
    });
  },

  // Track option selection
  trackOptionSelect: (nodeId: string, optionLabel: string, nodeTitle?: string) => {
    trackEvent('option_select', {
      category: 'beslisboom',
      action: 'select_option',
      label: optionLabel,
      node_id: nodeId,
      node_title: nodeTitle,
      option_label: optionLabel,
    });
  },

  // Track when user reaches a result
  trackResult: (nodeId: string, optionLabel: string, resultType?: string) => {
    trackEvent('result_reached', {
      category: 'beslisboom',
      action: 'result',
      label: optionLabel,
      node_id: nodeId,
      option_label: optionLabel,
      result_type: resultType,
    });
  },

  // Track navigation to alternative options
  trackAlternativeNavigation: (fromNodeId: string, toNodeId: string, alternativeType: string) => {
    trackEvent('alternative_navigation', {
      category: 'beslisboom',
      action: 'navigate_alternative',
      label: alternativeType,
      from_node_id: fromNodeId,
      to_node_id: toNodeId,
      alternative_type: alternativeType,
    });
  },

  // Track CTA clicks
  trackCTAClick: (ctaType: string, ctaLabel: string) => {
    trackEvent('cta_click', {
      category: 'beslisboom',
      action: 'cta_click',
      label: ctaLabel,
      cta_type: ctaType,
    });
  },

  // Track share action
  trackShare: (method?: string) => {
    trackEvent('share', {
      category: 'beslisboom',
      action: 'share',
      label: method || 'unknown',
    });
  },

  // Track restart
  trackRestart: () => {
    trackEvent('restart', {
      category: 'beslisboom',
      action: 'restart',
    });
  },

  // Track back navigation
  trackBack: (fromNodeId: string, toNodeId: string) => {
    trackEvent('back_navigation', {
      category: 'beslisboom',
      action: 'back',
      from_node_id: fromNodeId,
      to_node_id: toNodeId,
    });
  },
};

