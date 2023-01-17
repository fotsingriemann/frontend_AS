import React, { Component, Fragment } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableSortLabel,
  IconButton,
  Typography,
  Input,
  InputAdornment,
  withStyles,
} from '@material-ui/core'

const styles = (theme) => ({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableTableRow: {
    cursor: 'pointer',
  },
})

const ROWS_PER_PAGE = 5

class RouteList extends Component {
  state = {
    currentPage: 0,
    searchValue: '',
    order: 'desc',
  }

  handleRequestSort = (event) => {
    let order = 'desc'

    if (this.state.order === 'desc') {
      order = 'asc'
    }
    this.setState({ order }, () => {
      this.props.onRequestAreaSort(this.state.order)
    })
  }

  handlePageChange = (pageNumber) => this.setState({ currentPage: pageNumber })

  onSelectedRoute = (route) => this.props.onSelectedRoute(route)

  handleSearchValueChange = (e) =>
    this.setState({ searchValue: e.target.value })

  render() {
    const { classes, routes, selectedLanguage } = this.props
    const { currentPage, searchValue } = this.state
    const count = routes.length
    const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)

    const filteredRoutes = routes
      .filter((route) =>
        route.areaName.toLowerCase().includes(searchValue.toLowerCase())
      )
      .slice(
        currentPage * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      )

    return (
      <Fragment>
        <Input
          fullWidth
          placeholder={languageJson[selectedLanguage].routesPage.searchRoutes}
          onChange={this.handleSearchValueChange}
          startAdornment={
            <InputAdornment>
              <SearchIcon />
            </InputAdornment>
          }
        />

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].routesPage.routeDetails
                    .routeNameLabel
                }
              </TableCell>
              <TableCell size="small" sortDirection={this.state.order}>
                <TableSortLabel
                  active={true}
                  direction={this.state.order}
                  onClick={this.handleRequestSort}
                >
                  {
                    languageJson[selectedLanguage].routesPage.routeDetails
                      .createdOnLabel
                  }
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoutes.map((route) => (
              <TableRow
                hover
                className={classes.clickableTableRow}
                key={route.id}
                onClick={() => {
                  if (!this.state.enableDelete) this.onSelectedRoute(route)
                }}
              >
                <TableCell size="small">{route.areaName}</TableCell>
                <TableCell size="small">
                  {getFormattedTime(route.createdAt, 'lll')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={classes.customFooter}>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage - 1)
            }}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="caption">{`${from} - ${to} of ${count}`}</Typography>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage + 1)
            }}
            disabled={currentPage >= Math.ceil(count / ROWS_PER_PAGE) - 1}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </Fragment>
    )
  }
}

export default withLanguage(withStyles(styles)(RouteList))
