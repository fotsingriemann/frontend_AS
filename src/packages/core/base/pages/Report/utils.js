/**
 * @module Report/utils
 * @summary util functions for report module
 */

import gql from 'graphql-tag'
import getLoginId from '@zeliot/common/utils/getLoginId'

const DI_EVENT_COUNT_REF = [
  {
    key: 'Di_1',
    value: 'total_DI_1_Events',
  },
  {
    key: 'Di_2',
    value: 'total_DI_2_Events',
  },
  {
    key: 'Di_3',
    value: 'total_DI_3_Events',
  },
  {
    key: 'Di_4',
    value: 'total_DI_4_Events',
  },
]

/**
 * Constructs a graphql query based on parameters to fetch report
 * @param {number} category The report category
 * @param {string} reportType The type of the report
 * @param {string} reportName The name of the report
 * @param {string} uniqueId The uniqueId of the vehicle
 * @param {string} startTs The report start timestamp
 * @param {string} endTs The report end timestamp
 * @param {string[]} fields The fields needed for the report
 * @returns {object} The graphql query needed to fetch the report
 * @summary Returns a graphql query depending on the parameters
 */
export const getQueryToFetchReport = (
  category,
  reportType,
  reportName,
  uniqueId,
  offset,
  startTs,
  endTs,
  fields,
  previousDist
) => {
  let categoryField
  let eventCountFields = ''
  switch (category) {
    case 1:
      categoryField = 'categoryOneFields'
      break
    case 2:
      categoryField = 'categoryTwoFields'
      break
    case 3:
      categoryField = 'categoryThreeFields'
      break
    default:
      categoryField = ''
  }

  const fieldIDs = fields.map(({ fieldId }) => fieldId)
  const dynamicFields = fieldIDs.join('\n')
  const diEventTypes = getDIEventType(fieldIDs)

  if (category === 2) {
    reportType = `"${JSON.parse(reportType)[0]}"`
    if (reportType === `"digitalIO"`) {
      eventCountFields = ['totalDIEvents', ...diEventTypes].join('\n')
      console.log('event count fields', eventCountFields)
    } else {
      eventCountFields = ''
    }
  } else {
    reportType = null
  }

  // process.env.NODE_ENV !== 'production' &&
  //   console.log(
  //     `{
  //   report: getReportPagination(
  //     clientLoginId: ${getLoginId()},
  //     customReportName: "${reportName}",
  //     uniqueId: "${uniqueId}",
  //     start_ts: "${startTs}",
  //     end_ts: "${endTs}",
  //     offset:${offset},
  //     category: ${category},
  //     reportType: ${reportType}
  //     timezone: "${Intl.DateTimeFormat().resolvedOptions().timeZone}"
  //     previousDist: ${previousDist}
  //   ) {
  //     ${categoryField} {
  //       ${dynamicFields}
  //     }
  //     ${eventCountFields}
  //     continue_flag
  //     previousDist
  //     end_ts
  //   }
  // }`
  //   )

  return gql`{
    report: getReportPagination(
      clientLoginId: ${getLoginId()},
      customReportName: "${reportName}",
      uniqueId: "${uniqueId}",
      start_ts: "${startTs}",
      end_ts: "${endTs}",
      offset:${offset},
      category: ${category},
      reportType: ${reportType}
      timezone: "${Intl.DateTimeFormat().resolvedOptions().timeZone}"
      previousDist: ${previousDist}
    ) {
      ${categoryField} {
        ${dynamicFields}
      }
       ${eventCountFields}
      continue_flag
      previousDist
      end_ts
    }
  }`
}

const getDIEventType = (diEvents) => {
  const temp = {}
  diEvents.forEach((item) => {
    const _diKey = item.slice(0, 3)
    if (_diKey === 'Di_') {
      const _diEventKey = item.slice(0, 4)
      if (!temp[_diEventKey]) {
        temp[_diEventKey] = _diEventKey
      }
    }
  })

  const keys = Object.keys(temp)

  const _diEvents = DI_EVENT_COUNT_REF.filter(({ key }) => {
    return keys.includes(key)
  }).reduce((acc, item) => {
    acc.push(item.value)
    return acc
  }, [])

  return _diEvents
}

/**
 *
 * @param {fieldIds} data The field Id Array
 * @param {*} category
 */

/**
 * Parse and convert report data to remove `__typename` fields and make it usable directly
 * as table data
 * @param {object} data The report data object
 * @param {number} category The category of the report
 * @returns {object[]} The report data in table format
 * @summary Trims down the report data for use in table
 */
export const parseReportData = (data, category) => {
  let dataRows
  if (category === 1) {
    dataRows = data.categoryOneFields
  } else if (category === 2) {
    dataRows = data.categoryTwoFields
  } else {
    dataRows = data.categoryThreeFields
  }

  if (category === 3) {
    const miniDataRow = (({ __typename, ...dataRow }) => dataRow)(dataRows)
    dataRows = [Object.values(miniDataRow)]
  } else {
    dataRows = dataRows.map((dataRow) => {
      const miniDataRow = (({ __typename, ...dataRow }) => dataRow)(dataRow)
      dataRow = [...Object.values(miniDataRow)]

      if ('alertLoc' in miniDataRow && 'alertAddress' in miniDataRow) {
        const row = []

        for (const key in miniDataRow) {
          if (key === 'alertAddress') {
            row.push({
              label: miniDataRow.alertAddress,
              value: miniDataRow.alertLoc,
            })
          } else if (key !== 'alertLoc') {
            row.push(miniDataRow[key])
          }
        }

        dataRow = row
      }
      return dataRow
    })
  }

  return dataRows
}

/**
 * Converts a fieldId to a fieldName
 * @param {object[]} fields The report fields
 * @param {number} fieldId The fieldId
 * @returns {string|number} The fieldName for the fieldId or the fieldId if not found
 * @summary Finds the fieldname for the field ID
 */
export const getFieldNameFromFieldId = (fields, fieldId) => {
  // console.log('fields', fields, fieldId)
  try {
    return fields.find((field) => field.fieldId === fieldId).fieldName
  } catch (e) {
    return fieldId
  }
}

/**
 * Finds the field type from the field ID
 * @param {object[]} fields The fields to search the fieldID from
 * @param {number} fieldId The Field Id to search
 * @returns {string} The type of the field
 * @summary Returns the field Type from the field ID
 */
export const getFieldTypeFromFieldId = (fields, fieldId) => {
  try {
    return fields.find((field) => field.fieldId === fieldId).fieldType
  } catch (e) {
    return 'String'
  }
}

/**
 * Constructs a graphql query to download report based on the parameters passed
 * @param {number} category The category of the report
 * @param {string} reportType The type of the report
 * @param {string} reportName The name of the report
 * @param {string} uniqueId The unique Id of the vehicle
 * @param {string} startTs The start timestamp of the report
 * @param {string} endTs The end timestamp of the report
 * @param {object[]} fields The fields to request from the report
 * @return {object} The graphql query to download the report
 * @summary Returns a graphql query to make to download the report
 */
export const getQueryToDownloadReport = (
  category,
  reportType,
  reportName,
  uniqueId,
  offset,
  startTs,
  endTs,
  fields
) => {
  let queryName
  switch (category) {
    case 1:
      queryName = 'getCategoryOneReport'
      break
    case 2:
      queryName = 'getCategoryTwoReport'
      break
    case 3:
      queryName = 'getCategoryThreeReport'
      break
    default:
      queryName = ''
  }

  if (category === 2) {
    reportType = `reportType: "${JSON.parse(reportType)[0]}"`
  }

  const dynamicFields = fields.map(({ fieldId }) => fieldId).join('\n')

  const query = `{
    report: ${queryName}(
      clientLoginId: ${getLoginId()},
      customReportName: "${reportName}",
      uniqueId: "${uniqueId}",
      start_ts: "${startTs}",
      end_ts: "${endTs}",
      offset: ${offset}
      ${reportType || ''}
      timezone: "${Intl.DateTimeFormat().resolvedOptions().timeZone}"
    ) {
      ${dynamicFields}
    }
  }`

  process.env.NODE_ENV !== 'production' && console.log(query)

  return gql`
    ${query}
  `
}
