import React from 'react'
import { NavLink } from 'react-router-dom'
import { MenuList, MenuItem, Menu, makeStyles } from '@material-ui/core'
import { ROUNDED_PAPER } from '@zeliot/common/constants/classes'

const useStyles = makeStyles({
  popover: {
    pointerEvents: 'none'
  },
  paper: {
    pointerEvents: 'all',
    ...ROUNDED_PAPER
  },
  activeLink: {
    color: '#FF3366'
  },
  menuList: {
    '&:focus': {
      outline: 'none'
    }
  }
})

function CategoryMenu(props) {
  const { anchorEl, onClose, onMouseEnter, onMouseLeave, pages } = props
  const classes = useStyles()
  const open = Boolean(anchorEl)

  return (
    <div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        className={classes.popover}
        MenuListProps={{
          onMouseEnter,
          onMouseLeave
        }}
        classes={{
          paper: classes.paper
        }}
        onClick={onMouseLeave}
      >
        <MenuList className={classes.menuList}>
          {pages.map(page => (
            <MenuItem
              key={page.path}
              component={React.forwardRef((props, ref) => (
                <NavLink
                  {...props}
                  to={page.path}
                  activeClassName={classes.activeLink}
                  innerRef={ref}
                />
              ))}
            >
              {page.name}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  )
}

export default CategoryMenu
