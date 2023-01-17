/**
 * @module shared/DownloadProgressDialog/DownloadProgressDialog.context
 * @summary A React Context for providing access to DownloadProgressDialog to other components
 */

import React, { Component } from 'react'
import axios from 'axios'
import FileSaver from 'file-saver'
import { withApollo } from 'react-apollo'
import DownloadProgressDialog from './DownloadProgressDialog'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'

const DownloadProgressDialogContext = React.createContext()

/**
 * Function to get value from a nested property of an object
 * @param {object} object Object to get value from
 * @param {string[]} pathArray Array of nested keys in order
 */
function getter(object, pathArray) {
  let obj = object
  for (let i of pathArray) {
    obj = obj[i]
  }
  return obj
}

/**
 * @summary React context provider for providing access to DownloadProgressDialog
 */
class DownloadProgressDialogContextProvider extends Component {
  /**
   * @property {boolean} isOpen State variable to determine if DownloadProgressDialog is open
   * @property {object[]} downloadList State variable to maintain list of active downloads
   * @property {number} fileId State variable to keep count of active downloads
   */
  state = {
    isOpen: false,
    title: 'Downloading',
    downloadList: [],
    fileId: 0
  }

  /**
   * @summary Opens the DownloadProgressDialog
   */
  openDialog = () =>
    this.setState({
      isOpen: true
    })

  /**
   * @summary Closes the DownloadProgressDialog and clears the download list
   */
  closeDialog = () =>
    this.setState({ isOpen: false, downloadList: [], fileId: 0 })

  /**
   * @summary Remove an item from the download list by Id
   * @param {number} id The id of the item to be removed
   */
  removeItem = id => {
    this.setState(
      ({ downloadList }) => ({
        downloadList: downloadList.filter(item => item.id !== id)
      }),
      () => {
        if (!this.state.downloadList.length) {
          this.setState({ isOpen: false })
        }
      }
    )
  }

  /**
   * @summary Add custom title to dialog
   * @param {string} name Title on dialog's header
   */
  setDialogTitle = name => {
    this.setState({ title: name })
  }

  /**
   * @summary Downloads a report using the given query & variables
   * @param {object} query The query to use for downloading report
   * @param {object} variables Variables to be used for querying report
   * @param {string} fileName The fileName to be used for the downloaded report
   */
  downloadReport = async (query, variables, pathArray, fileName) => {
    const fileId = this.state.fileId
    this.setState(
      ({ downloadList }) => ({
        downloadList: [
          ...downloadList,
          {
            name: fileName,
            id: fileId,
            done: false
          }
        ],
        fileId: fileId + 1
      }),
      () => {
        if (this.state.downloadList.length) {
          this.setState({ isOpen: true })
        }
      }
    )

    const response = await this.props.client.query({
      query,
      variables,
      errorPolicy: 'all'
    })

    if (response.errors) {
      this.props.openSnackbar('Failed to download', { type: 'error' })
      this.removeItem(fileId)
    } else if (response.data) {
      const link = getter(response.data, pathArray)

      if (!link) {
        this.props.openSnackbar('No data available for selected period')
        this.removeItem(fileId)
      } else {
        const res = await axios({
          url: link,
          method: 'GET',
          headers: {
            Accept:
              variables.fileType === 'EXCEL'
                ? 'application/vnd.ms-excel'
                : 'application/pdf'
          },
          responseType: 'blob' // important
        }).catch(() => {
          this.props.openSnackbar('Error downloading')
        })

        if (res) {
          const fileNameWithExtension =
            variables.fileType === 'EXCEL'
              ? `${fileName}.xlsx`
              : `${fileName}.pdf`

          FileSaver.saveAs(new Blob([res.data]), fileNameWithExtension)
          const downloadList = this.state.downloadList

          for (let item of downloadList) {
            if (item.id === fileId) {
              item.done = true
            }
          }

          this.setState({
            downloadList
          })
          setTimeout(() => this.removeItem(fileId), 5000)
        } else {
          this.removeItem(fileId)
        }
      }
    }
  }

  render() {
    const { children } = this.props

    return (
      <DownloadProgressDialogContext.Provider
        value={{
          openDialog: this.openDialog,
          closeDialog: this.closeDialog,
          isOpen: this.state.isOpen,
          title: this.state.title,
          setDialogTitle: this.setDialogTitle,
          downloadReport: this.downloadReport
        }}
      >
        <DownloadProgressDialog items={this.state.downloadList} />
        {children}
      </DownloadProgressDialogContext.Provider>
    )
  }
}

export const DownloadProgressDialogConsumer =
  DownloadProgressDialogContext.Consumer

export const DownloadProgressDialogProvider = withApollo(
  withSharedSnackbar(DownloadProgressDialogContextProvider)
)
