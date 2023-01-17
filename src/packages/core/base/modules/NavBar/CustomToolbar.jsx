import React from 'react'
import { Hidden, Toolbar } from '@material-ui/core'

function CustomToolbar({ children }) {
  return (
    <>
      <Hidden smDown>
        <Toolbar variant="dense">{children}</Toolbar>
      </Hidden>
      <Hidden mdUp>
        <Toolbar variant="dense" disableGutters={true}>
          {children}
        </Toolbar>
      </Hidden>
    </>
  )
}

export default CustomToolbar
