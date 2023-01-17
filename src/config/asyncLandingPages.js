/**
 * Different landing pages exported as lazy loaded react components
 * @module asyncLandingPages
 * @summary Lazy loaded landing pages
 */

import React from 'react'
import Loadable from 'react-loadable'
import Loader from '@zeliot/common/ui/Loader'

/**
 * Default landing page with Zeliot's branding and background image as an async component
 * @summary The default landing page
 */
export const AsyncDefaultLanding = Loadable({
  loader: () => import('@zeliot/core/base/pages/Landing'),
  loading: () => <Loader fullscreen={true} />
})

/**
 * Landing page without Zeliot's branding as an async component
 * @summary The plain landing page
 */
export const AsyncPlainLanding = Loadable({
  loader: () => import('@zeliot/core/custom/pages/Landing'),
  loading: () => <Loader fullscreen={true} />
})

/**
 * Landing page to test landing page configuration as an async component
 * @summary A simple landing page for testing
 */
export const AsyncTestLanding = Loadable({
  loader: () => import('@zeliot/school/base/pages/Landing'),
  loading: () => <Loader fullscreen={true} />
})
