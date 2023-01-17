import React from 'react'
import ReactDOM from 'react-dom'
import ComboBox from './ComboBox.jsx'

const comboBoxProps = {
  items: [
    {
      id: 1,
      text: 'Hello'
    },
    {
      id: 2,
      text: 'Bye'
    },
    {
      id: 3,
      text: 'World'
    },
    {
      id: 4,
      text: 'Good'
    },
    {
      id: 5,
      text: 'Jest'
    },
    {
      id: 6,
      text: 'Test'
    },
    {
      id: 7,
      text: 'React'
    },
    {
      id: 8,
      text: 'Graphql'
    }
  ],
  selectedItem: null,
  onSelectedItemChange: item => {

  },
  placeholder: 'Keywords',
  isLoading: false,
  itemKey: 'id',
  itemToStringKey: 'text'
}

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <ComboBox {...comboBoxProps}/>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
