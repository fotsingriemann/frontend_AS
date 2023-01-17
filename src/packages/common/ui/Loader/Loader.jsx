/**
 * @module Loader
 * @summary This module exports the Loader component
 */

import React from 'react'
import PropTypes from 'prop-types'
import FullScreenLoader from './FullScreenLoader.jsx'
import { CircularProgress } from '@material-ui/core'

/**
 * The loader component shos a spinning loader to indicate loading status
 * @function
 * @param {object} props The props to the Loader component
 */
function Loader(props) {
  const {
    style,
    mergeStyle,
    fullscreen,
    showSpinner,
    spinnerSize
  } = props

  if (fullscreen) return <FullScreenLoader showSpinner={showSpinner} />

  const defaultLoaderStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  let loaderStyle = {}

  if (style) {
    if (mergeStyle) {
      loaderStyle = {
        ...defaultLoaderStyle,
        ...style
      }
    } else {
      loaderStyle = style
    }
  } else {
    loaderStyle = defaultLoaderStyle
  }

  const loader = showSpinner ? (
    <CircularProgress size={spinnerSize} color="primary" />
  ) : (
    'Loading ...'
  )

  return (
    <div style={loaderStyle} id="1">
      {loader}
    </div>
  )
}

Loader.propTypes = {
  style: PropTypes.object,
  mergeStyle: PropTypes.bool,
  fullscreen: PropTypes.bool,
  showSpinner: PropTypes.bool,
  spinnerSize: PropTypes.number
}

Loader.defaultProps = {
  fullscreen: false,
  showSpinner: true,
  spinnerSize: 24
}

export default Loader
