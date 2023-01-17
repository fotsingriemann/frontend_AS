import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import { useLocation } from 'react-router-dom'
import { Grid, makeStyles, Typography } from '@material-ui/core'
import Loader from '@zeliot/common/ui/Loader'
import getLoginId from '@zeliot/common/utils/getLoginId'
import menuConfig from 'config/menuConfig'
import CategoryButton from './CategoryButton'
// import groupPagesByCategories from './utils/groupPagesByCategories'
// import sortGroupsAndPages from './utils/sortGroupsAndPages'

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

    getAllClientAds(clientLoginId: $loginId) {
      imageURL
      redirectURL
      placeOfImage
    }
  }
`

const useStyles = makeStyles({
  MenuContainer: {
    width: '100%',
    overflowX: 'auto',
    flexWrap: 'noWrap',
  },

  MenuGrid: {
    height: '100%',
    width: '100%',
    overflowX: 'auto',
    flexWrap: 'noWrap',
  },

  MenuItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    margin: '0 auto',
    minWidth: 150,
  },

  selectedCategory: {
    color: 'secondary',
  },
})

function getMenuConfig(features) {
  const menuConfigObject = features.reduce((acc, cur) => {
    const { category, ...curPageConfig } = menuConfig[cur.key]

    if (category) {
      if (acc[category.name]) {
        acc[category.name].pages.push({
          name: curPageConfig.name,
          icon: curPageConfig.icon,
          path: curPageConfig.path,
          order: curPageConfig.order,
        })
      } else {
        acc[category.name] = {
          name: category.name,
          icon: category.icon,
          order: category.order,
          pages: [],
        }

        acc[category.name].pages.push({
          name: curPageConfig.name,
          icon: curPageConfig.icon,
          path: curPageConfig.path,
          order: curPageConfig.order,
        })
      }
    } else {
      acc[curPageConfig.name] = {
        name: curPageConfig.name,
        icon: curPageConfig.icon,
        path: curPageConfig.path,
        order: curPageConfig.order,
      }
    }

    return acc
  }, {})

  return Object.values(menuConfigObject)
    .sort((a, b) => a.order - b.order)
    .map((config) => {
      if (config.pages) {
        return {
          ...config,
          pages: config.pages.sort((a, b) => a.order - b.order),
        }
      }

      return config
    })
}

function HorizontalMenu() {
  const { loading, error, data } = useQuery(GET_USER_CONFIGURATION, {
    variables: { loginId: getLoginId() },
  })

  const classes = useStyles()

  const location = useLocation()

  if (loading) return <Loader />
  if (error) return 'Error'

  const userConfigData = data || DEFAULT_USER_CONFIG

  if (
    Object.keys(userConfigData.userConfiguration.plan).length === 0 &&
    userConfigData.userConfiguration.plan.constructor === Object
  ) {
    userConfigData.userConfiguration.plan = DEFAULT_USER_CONFIG.plan
  }

  const menuConfig = getMenuConfig(
    userConfigData.userConfiguration.plan.features
  )

  // const categories = groupPagesByCategories(
  //   userConfigData.userConfiguration.plan.features
  // )

  // const itemList = sortGroupsAndPages(categories)

  return (
    <div className={classes.MenuContainer}>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        className={classes.MenuGrid}
      >
        {/* {itemList.map(item => {
          const MenuIcon = item.category.icon

          const isSelected = item.pages.some(
            page => page.path === location.pathname
          )

          return (
            <div key={item.category.key} className={classes.MenuItem}>
              <CategoryButton pages={item.pages}>
                <MenuIcon
                  className={isSelected ? classes.selectedCategory : ''}
                />
              </CategoryButton>

              <Typography
                className={isSelected ? classes.selectedCategory : ''}
              >
                {item.category.name}
              </Typography>
            </div>
          )
        })} */}

        {menuConfig.map((item) => {
          const MenuIcon = item.icon

          const isSelected = item.path
            ? location.pathname === item.path
            : item.pages.some((page) => page.path === location.pathname)

          return (
            <div key={item.name} className={classes.MenuItem}>
              <CategoryButton pages={item.pages} path={item.path}>
                <MenuIcon
                  className={isSelected ? classes.selectedCategory : ''}
                />
              </CategoryButton>

              <Typography
                className={isSelected ? classes.selectedCategory : ''}
              >
                {item.name}
              </Typography>
            </div>
          )
        })}
      </Grid>
    </div>
  )
}

export default HorizontalMenu
