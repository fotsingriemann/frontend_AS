/**
 * @module hoc/withSharedSnackbar
 * @summary HOC to provide methods to open snackbar
 */

import React from 'react'
import { SharedSnackbarConsumer } from '@zeliot/common/shared/SharedSnackbar/SharedSnackbar.context'

export default Component => props => (
  <SharedSnackbarConsumer>
    {({ openSnackbar }) => <Component openSnackbar={openSnackbar} {...props} />}
  </SharedSnackbarConsumer>
)
