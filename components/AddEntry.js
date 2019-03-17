import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { getMetricMetaInfo, timeToString, getDailyReminderValue } from '../utils/helpers'
import UdaciSlider from './UdaciSlider'
import Steppers from './Steppers'
import DateHeader from './DateHeader'
import { Ionicons } from '@expo/vector-icons'
import TextButton from './TextButton'
import { submitEntry, removeEntry } from '../utils/api'
import { connect } from 'react-redux'
import { addEntry } from '../actions/index'

function SubmitBtn ({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}>
      <Text>Submit</Text>
    </TouchableOpacity>
    )
}

class AddEntry extends React.Component {
  state = {
    run:0,
    bike:0,
    swim:0,
    sleep:0,
    eat:0,
  }

increment = (metric) => {
  const { max, step } = getMetricMetaInfo(metric)

  this.setState((state) => {
    const count = state[metric] + step

    return {
      ...state,
      [metric]: count > max ? max : count
    }
  })
}


decrement = (metric) => {

  this.setState((state) => {
    const count = state[metric] - getMetricMetaInfo(metric).step

    return {
      ...state,
      [metric]: count < 0 ? 0 : count
    }
  })
}

slide = (metric, value) => {
  this.setState(() => ({
    [metric]: value
  }))
}

submit = () => {
  const key = timeToString()
  const entry = this.state

  this.props.dispatch(addEntry({
    [key]: entry
  }))

  this.setState(() => ({
    run:0,
    bike:0,
    swim:0,
    sleep:0,
    eat:0,
  }))
  //Nav to Home

  submitEntry({ key, entry})

  //clear local notification
}

reset = () => {
  const key = timeToString()

  this.props.dispatch(addEntry({
    [key]: getDailyReminderValue()
  }))

//route to home

  removeEntry(key)
}

render(){
  const metaInfo = getMetricMetaInfo()

  if (this.props.alreadyLogged) {
    return (
      <View>
        <Ionicons
          name='ios-happy-outline'
          size={100}
        />
        <Text> You aleady Logged your information for today </Text>
        <TextButton onPress={this.reset}>
          Rest
        </TextButton>
      </View>
      )
  }
  return (
    <View>
     <DateHeader date={(new Date()).toLocaleDateString()}/>
                     <SubmitBtn onPress={this.submit}/>

      {Object.keys(metaInfo).map((key) => {
        const { getIcon, type, ...rest } = metaInfo[key]
        const value = this.state[key]

        return (
          <View key={key}>

            {getIcon()}
            {type === 'slider'
            ? <UdaciSlider
                value={value}
                onChange={(value) => this.slide(key, value)}
                {...rest}
              />
            : <Steppers
                value={value}
                onIncrement={() => this.increment(key)}
                onDecrement={() => this.decrement(key)}
                {...rest}
              />
            }
          </View>
          )
      })}
    </View>
    )
}
}

function mapStateToProps (state) {
  const key = timeToString()

  return {
    alreadyLogged: state[key] && typeof state[key].today === 'undefined'
  }
}

export default connect(mapStateToProps)(AddEntry)