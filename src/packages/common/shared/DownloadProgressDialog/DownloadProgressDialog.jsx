/**
 * @module shared/DownloadProgressDialog/DownloadProgressDialog
 * @summary This module implements the DownloadProgressDialog component
 */

import React from 'react'
import {
  DOWNLOAD_PROGRESS_DIALOG_STYLE,
  DOWNLOAD_PROGRESS_DIALOG_HEADER_STYLE
} from './styles'
import { DownloadProgressDialogConsumer } from './DownloadProgressDialog.context'
import DoneIcon from '@material-ui/icons/Done'

import {
  withStyles,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@material-ui/core'

/**
 * Implements a layout with list of items and their download status
 * @summary DownloadProgressDialog component
 */
const DownloadProgressDialogContent = withStyles(
  DOWNLOAD_PROGRESS_DIALOG_HEADER_STYLE
)(({ title, classes, items }) => (
  <Grid container>
    <Grid item xs={12}>
      <Grid
        container
        alignContent="center"
        alignItems="center"
        justify="space-between"
        className={classes.downloadProgressDialogHeader}
      >
        <Grid item>{title}</Grid>
      </Grid>
    </Grid>
    <Grid item xs={12}>
      <List>
        {items.map(item => (
          <ListItem key={item.id} dense>
            <ListItemText>{item.name}</ListItemText>
            <ListItemIcon>
              {item.done ? <DoneIcon /> : <CircularProgress size={24} />}
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </Grid>
  </Grid>
))

/**
 * Shows {@link DownloadProgressDialogContent} inside a card depending on `DownloadProgressDialogConsumer`s
 * status, whether the dialog should closed or open
 * @param {object} props React component props
 */
const DownloadProgressDialog = ({ classes, items }) => (
  <DownloadProgressDialogConsumer>
    {({ isOpen, title }) =>
      isOpen && (
        <Card className={classes.downloadProgressDialog}>
          <DownloadProgressDialogContent title={title} items={items} />
        </Card>
      )
    }
  </DownloadProgressDialogConsumer>
)

export default withStyles(DOWNLOAD_PROGRESS_DIALOG_STYLE)(
  DownloadProgressDialog
)
