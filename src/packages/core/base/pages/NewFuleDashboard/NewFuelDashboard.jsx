/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react'
import { useStyles, reportStyle } from './NewFuelDashboardCSS'
import { withApollo } from 'react-apollo'
import { useState } from 'react'
import gql from 'graphql-tag'
import moment from 'moment'
import { ReportConfig } from './ReportConfig'

import { useReport } from 'powerbi-report-component'
// import { models } from 'powerbi-client'

const GET_EMEBEDTOKEN = gql`
  query($appId: String!, $workspaceId: String!, $reportId: String!) {
    getEmbedTokenPowerBI(
      appId: $appId
      workspaceId: $workspaceId
      reportId: $reportId
    ) {
      id
      embedUrl
      embedToken
      expiration
    }
  }
`

function NewFuelDashboard(props) {
	const classes = useStyles()
	const [applicationId, setApplicationId] = useState(null)
	const [embedURL, setEmbedURL] = useState(null)
	const [embedToken, setEmbedToken] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const reportRef = useRef(null)
	const [report, setEmbed] = useReport()

	const myReportConfig = {
		embedType: 'report',
		tokenType: 'Embed',
		accessToken: embedToken,
		embedUrl: embedURL,
		embedId: applicationId,
		extraSettings: {
			filterPaneEnabled: false,
			navContentPaneEnabled: false,
		},
	}

	const getEmbedToken = async () => {
		const { data, errors, loading } = await props.client.query({
			query: GET_EMEBEDTOKEN,
			variables: ReportConfig,
			fetchPolicy: 'network-only',
		})
		// console.log(data, loading)
		if (data.getEmbedTokenPowerBI) {
			const { getEmbedTokenPowerBI } = data
			setEmbedToken(getEmbedTokenPowerBI.embedToken)
			setEmbedURL(getEmbedTokenPowerBI.embedUrl)
			setApplicationId(getEmbedTokenPowerBI.id)
			setIsLoading(true)
			localStorage.setItem(
				'fuelToken',
				getEmbedTokenPowerBI.embedToken
			)
			localStorage.setItem(
				'fuelUrl',
				getEmbedTokenPowerBI.embedUrl
			)
			localStorage.setItem(
				'fuelExpire',
				Number(getEmbedTokenPowerBI.expiration) / 1000
			)
		}
	}

	const handleClick = () => {
		// you can use "report" from useReport like
		if (report) {
			report.print()
		}
	}

	const getTokenFromLocalStorage = () => {
		const token = localStorage.getItem('fuelToken')
		const url = localStorage.getItem('fuelUrl')
		setEmbedToken(token)
		setEmbedURL(url)
		setApplicationId(ReportConfig.reportId)
	}

	const isTokenExpired = () => {
		const currentTime = moment().unix()
		const expireTime = localStorage.getItem('fuelExpire')
			? Number(localStorage.getItem('fuelExpire'))
			: 0
		return expireTime - currentTime <= 0 ? true : false
	}

	useEffect(() => {
		if (isTokenExpired()) {
			getEmbedToken()
		} else {
			getTokenFromLocalStorage()
		}
	}, [])

	useEffect(() => {
		if (embedToken && applicationId && embedURL) {
			setEmbed(reportRef, myReportConfig)
		}
	}, [embedToken, applicationId, embedURL])

	return (
		<div className={classes.root}>
			<div
				style={{
					position: 'relative',
					overflow: 'hidden',
					paddingTop: '61.9%',
				}}
			>
				<div className={classes.reportStyle} ref={reportRef} />
			</div>
		</div>
	)
}

export default withApollo(NewFuelDashboard)