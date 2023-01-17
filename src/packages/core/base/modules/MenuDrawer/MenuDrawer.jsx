/**
 * @module MenuDrawer
 * @summary This module exports the MenuDrawer component
 */

import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { NavLink, withRouter } from 'react-router-dom'
import {
  withStyles,
  Drawer,
  List,
  ListItem,
  ListSubheader,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@material-ui/core'
import { MENU_DRAWER_WIDTH } from '@zeliot/common/constants/styles'
import Loader from '@zeliot/common/ui/Loader'
import getLoginId from '@zeliot/common/utils/getLoginId'
import groupPagesByCategories from './utils/groupPagesByCategories'
import sortGroupsAndPages from './utils/sortGroupsAndPages'
import { setItem, getItem } from '../../../../../storage.js'

const DEFAULT_USER_CONFIG = {
  config: {
    theme: {},
    configuration: {},
  },
  plan: {
    features: [
      {
        key: 'ANALYTICS_DASHBOARD',
      },
      {
        key: 'ALERTS_CONFIG',
      },
      {
        key: 'REPORT',
      },
      {
        key: 'MANAGE_USERS',
      },
      {
        key: 'MANAGE_DRIVERS',
      },
      {
        key: 'MANAGE_VEHICLES',
      },
      {
        key: 'MANAGE_DRIVERS_VIEW',
      },
      {
        key: 'MANAGE_VEHICLES_VIEW',
      },
      {
        key: 'MANAGE_ACCOUNT',
      },
      {
        key: 'GOOGLE_MAPS',
      },
      {
        key: 'GOOGLE_MAPS1',
      },
      {
        key: 'AOI',
      },
      {
        key: 'ROUTES',
      },
      {
        key: 'TRIPS',
      },
      {
        key: 'IMMOBILIZE',
      },
    ],
  },
}

const GET_USER_CONFIGURATION = gql`
  query($loginId: Int!) {
    userConfiguration {
      plan
      config {
        configuration
        theme
      }
    }
    clientDetail(loginId: $loginId) {
      isERP
    }
    getAllClientAds(clientLoginId: $loginId) {
      imageURL
      redirectURL
      placeOfImage
    }
  }
`

const styles = (theme) => ({
  drawerPaperHello: {
    width: MENU_DRAWER_WIDTH,
    height: '100%',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.complex,
    }),
    overflowY: 'hidden',
  },
  drawer: {
    height: '100%',
    position: 'relative',
  },
  drawerPaperMini: {
    width: theme.spacing(7),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.complex,
    }),
    overflowX: 'hidden',
  },
  drawerPaperClose: {
    width: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.complex,
    }),
    overflowX: 'hidden',
  },
  menuItem: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    '&:hover, &:focus': {
      background: theme.palette.secondary.main,
    },
  },
  tooltipRight: {
    marginLeft: theme.spacing(10),
  },
  highlightedItem: {
    color: 'white',
    fontWeight: 600,
  },
  listItemIcon: {
    paddingRight: 8,
    minWidth: 0,
  },
  listItemText: {
    padding: 0,
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  listIcon: {
    minWidth: 'unset',
    marginRight: theme.spacing(2),
  },
  listItemContainer: {
    width: '100%',
    display: 'flex',
  },
})

/**
 * @param {object} props React component props
 * @summary Renders list item text conditionally based on mini prop
 */
function Subheading(props) {
  const heading = props.heading
  const isMini = props.isMini
  if (isMini === true) {
    return null
  } else {
    return heading
  }
}

/**
 * @param {object} props React component props
 * @summary Renders an Icon for List item with tooltip
 */
function RenderIcon(props) {
  const {
    isMini,
    icon: MIcon,
    tooltipText,
    isHighlighted,
    highlightedItemClass,
    itemIconClass,
  } = props

  if (isMini === true) {
    return (
      <Tooltip
        title={tooltipText}
        placement="right"
        classes={styles.tooltipRight}
      >
        <ListItemIcon className={itemIconClass}>
          <MIcon className={isHighlighted ? highlightedItemClass : ''} />
        </ListItemIcon>
      </Tooltip>
    )
  } else {
    return (
      <ListItemIcon className={itemIconClass}>
        <MIcon className={isHighlighted ? highlightedItemClass : ''} />
      </ListItemIcon>
    )
  }
}

/**
 * @param {object} props React component props
 * @summary MenuDrawerList component renders the list of main menu items
 */
function MenuDrawerList(props) {
  const component = props.itemList[0].pages[0].component
  const icon = props.itemList[0].pages[0].icon
  const dashboard2 = {
    name: 'DASUR Dashboard',
    icon,
    path: '/home/dashboard1',
    order: 1,
    component,
  }

  props.itemList[0].pages.push(dashboard2)

  const { isMini, currentPath, itemList, classes } = props

  return (
    <List dense>
      {itemList.map(({ category, pages }) => (
        <React.Fragment key={category.key}>
          <ListSubheader disableSticky={true}>
            <Subheading heading={category.name} isMini={isMini} />
          </ListSubheader>

          {pages.map((page) => (
            <ListItem
              key={page.name}
              button
              component={React.forwardRef((props, ref) => (
                <NavLink
                  innerRef={ref}
                  to={page.path}
                  activeClassName={classes.menuItem}
                  {...props}
                />
              ))}
            >
              <RenderIcon
                isMini={isMini}
                icon={page.icon}
                tooltipText={page.name}
                isHighlighted={currentPath === page.path}
                highlightedItemClass={classes.highlightedItem}
                itemIconClass={classes.listItemIcon}
              />

              {!isMini && (
                <ListItemText
                  className={classes.listItemText}
                  classes={{
                    primary:
                      currentPath === page.path && classes.highlightedItem,
                  }}
                  color="inherit"
                >
                  {page.name}
                </ListItemText>
              )}
            </ListItem>
          ))}
          <Divider />
        </React.Fragment>
      ))}
    </List>
  )
}

/**
 * @param {object} props React component props
 * @summary Renders a collapsible menu drawer
 */
function MenuDrawer(props) {
  const {
    classes,
    history: {
      location: { pathname },
    },
    isMenuDrawerOpen,
    isBannerOpen,
    onClose,
    variant,
    miniMode,
  } = props

  return (
    <Drawer
      anchor="left"
      open={isMenuDrawerOpen}
      variant={variant}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      onClose={onClose}
      classes={{
        paper: classNames(classes.banner, classes.drawerPaperHello, {
          'banner-top-margin drawer-height-with-banner': isBannerOpen,
          'appbar-top-margin drawer-height-with-appbar': !isBannerOpen,
          [classes.drawerPaperMini]: !isMenuDrawerOpen,
          [classes.drawerPaperClose]: !miniMode && !isMenuDrawerOpen,
        }),
      }}
    >
      <div className={classes.drawer}>
        <Query
          query={GET_USER_CONFIGURATION}
          variables={{ loginId: getLoginId() }}
        >
          {({ loading, error, data }) => {
            if (loading) return <Loader />
            if (error) return 'Error'
            data = data || DEFAULT_USER_CONFIG

            if (
              Object.keys(data.userConfiguration.plan).length === 0 &&
              data.userConfiguration.plan.constructor === Object
            ) {
              data.userConfiguration.plan = DEFAULT_USER_CONFIG.plan
            }

            const features = data.userConfiguration.plan.features

            let filteredFeatures = features

            if (filteredFeatures.length === 0) {
              filteredFeatures.push({ key: 'MANAGE_ACCOUNT' })
            }

            const accountType = getItem('accountType', 'PERSISTENT')
            if (accountType !== 'CLT') {
              filteredFeatures = features.filter(
                (features) => features.key !== 'MANAGE_USERS'
              )
            }

            const categories = groupPagesByCategories(filteredFeatures)

            const itemList = sortGroupsAndPages(categories)

            // const plan = data.userConfiguration.plan.name
            // const { isERP } = data.clientDetail
            // console.log('isERP', isERP)
            // setItem('plan', plan, 'PERSISTENT')
            // setItem('isERP', isERP, 'PERSISTENT')

            let drawerAd

            if (data.getAllClientAds && Array.isArray(data.getAllClientAds)) {
              drawerAd = data.getAllClientAds.find(
                (ad) => ad.placeOfImage === 'DRAWER'
              )
            }

            if (drawerAd) {
              return (
                <DrawerWithAds
                  isMenuDrawerOpen={isMenuDrawerOpen}
                  classes={classes}
                  pathname={pathname}
                  itemList={itemList}
                  ad={drawerAd}
                />
              )
            } else {
              return (
                <PlainDrawer
                  isMenuDrawerOpen={isMenuDrawerOpen}
                  classes={classes}
                  pathname={pathname}
                  itemList={itemList}
                />
              )
            }
          }}
        </Query>
      </div>
    </Drawer>
  )
}

/**
 * @param {object} props React component props
 * @summary Renders a drawer with menu list
 */
function PlainDrawer(props) {
  const { isMenuDrawerOpen, classes, pathname, itemList } = props

  return (
    <React.Fragment>
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <MenuDrawerList
          isMini={!isMenuDrawerOpen}
          currentPath={pathname}
          itemList={itemList}
          classes={classes}
        />
      </div>
    </React.Fragment>
  )
}

/**
 * @param {object} props React component props
 * @summary Renders a menu drawer with Advertisement
 */
function DrawerWithAds(props) {
  const { isMenuDrawerOpen, classes, pathname, itemList, ad } = props

  return (
    <React.Fragment>
      <div
        style={{
          height: 'calc(100% - 200px)',
          overflowY: 'auto',
        }}
      >
        <MenuDrawerList
          isMini={!isMenuDrawerOpen}
          itemList={itemList}
          currentPath={pathname}
          classes={classes}
        />
      </div>

      <div
        style={{
          height: 200,
          width: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <a href={ad.redirectURL} target="_blank" rel="noopener noreferrer">
          <img src={ad.imageURL} alt="Sample Ad" />
        </a>
      </div>
    </React.Fragment>
  )
}

MenuDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  isMenuDrawerOpen: PropTypes.bool.isRequired,
  variant: PropTypes.string,
}

MenuDrawer.defaultProps = {
  variant: 'persistent',
}

export default withStyles(styles)(withRouter(MenuDrawer))
