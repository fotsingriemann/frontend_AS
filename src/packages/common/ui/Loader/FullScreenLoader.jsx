/**
 * @module FullScreenLoader
 * @summary This module exports the FullScreenLoader component
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Grid, CircularProgress } from '@material-ui/core'

/**
 * FullScreenLoader displays a spinning loader when loading components
 * for the entire viewport
 * @function
 * @param {object} props The props for the FullScreenLoader component
 */
function FullScreenLoader(props) {
  const { showSpinner } = props

  return (
    <Grid
      container
      alignItems="center"
      justify="center"
      style={{ height: '100vh', width: '100%' }}
    >
      <Grid item>
        {showSpinner ? <CircularProgress size={100} /> : 'Loading ...'}
      </Grid>
    </Grid>
  )
}

FullScreenLoader.propTypes = {
  showSpinner: PropTypes.bool
}

FullScreenLoader.defaultProps = {
  showSpinner: true
}

export default FullScreenLoader
