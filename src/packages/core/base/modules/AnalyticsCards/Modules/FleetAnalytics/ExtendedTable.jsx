import React from 'react'
import {
  Input,
  InputAdornment,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination
} from '@material-ui/core'

import { Search, Close } from '@material-ui/icons'

const ROWS_PER_PAGE = 5

function ExtendedTable(props) {
  const {
    data: { head, body }
  } = props

  const [page, setPage] = React.useState(0)

  const [searchText, setSearchText] = React.useState('')

  let filteredRows

  if (searchText) {
    const searchTextLowerCase = searchText.toLowerCase()
    filteredRows = body.filter(row =>
      row[0].toLowerCase().includes(searchTextLowerCase)
    )
  } else {
    filteredRows = body
  }

  function handlePageChange(e, page) {
    setPage(page)
  }

  function handleSearchTextChange(e) {
    setSearchText(e.target.value)
    setPage(0)
  }

  function resetSearchText() {
    setSearchText('')
    setPage(0)
  }

  const slicedRows = filteredRows.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  )

  return (
    <React.Fragment>
      <Input
        value={searchText}
        onChange={handleSearchTextChange}
        placeholder="Search Vehicle"
        startAdornment={
          <InputAdornment>
            <Search />
          </InputAdornment>
        }
        endAdornment={
          searchText === '' ? null : (
            <InputAdornment>
              <IconButton onClick={resetSearchText}>
                <Close />
              </IconButton>
            </InputAdornment>
          )
        }
      />

      <Table>
        <TableHead>
          <TableRow>
            {head.map(title => (
              <TableCell key={title}>{title}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {slicedRows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((column, index) => (
                <TableCell key={index}>{column}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={ROWS_PER_PAGE}
        page={page}
        backIconButtonProps={{
          'aria-label': 'Previous Page'
        }}
        nextIconButtonProps={{
          'aria-label': 'Next Page'
        }}
        onChangePage={handlePageChange}
      />
    </React.Fragment>
  )
}

export default ExtendedTable
