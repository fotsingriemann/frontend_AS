import React from 'react'
import PropTypes from 'prop-types'
function Badge({ color, background, children }) {
  return (
    <div
      style={{
        background,
        color,
        padding: 4,
        borderRadius: 3,
        display: 'inline'
      }}
    >
      {children}
    </div>
  )
}

Badge.propTypes = {
  background: PropTypes.string,
  color: PropTypes.string
}

Badge.defaultProps = {
  background: '#f7f7f7',
  color: 'black'
}

export default Badge
