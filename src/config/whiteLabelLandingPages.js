/**
 * Stores configuration of landing pages
 * @module whiteLabelLandingPages
 * @summary Configuration of custom landing pages
 */
import * as pages from './asyncLandingPages.js'

export default {
  AQUILATRACK: {
    component: pages.AsyncDefaultLanding
  },
  PLAIN: {
    component: pages.AsyncPlainLanding
  },
  RANDOMIZER: {
    component: pages.AsyncTestLanding
  }
}
