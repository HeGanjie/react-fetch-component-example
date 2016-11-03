/**
 * Created by heganjie on 16/9/26.
 * 参考了 https://github.com/smalldots/smalldots/blob/master/src/Fetch.js
 */

import {Component, PropTypes} from 'react'
import _ from 'lodash'
import isomorphicFetch from 'isomorphic-fetch'

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export default class Fetch extends Component {
  static propTypes = {
    method: PropTypes.oneOf(['get', 'post', 'put', 'delete']),
    url: PropTypes.string.isRequired,
    params: PropTypes.object,
    headers: PropTypes.object,
    body: PropTypes.object,
    lazy: PropTypes.bool,
    onResponse: PropTypes.func,
    onData: PropTypes.func,
    onError: PropTypes.func,
    onFetchingStateChange: PropTypes.func,
    children: PropTypes.func.isRequired,
    fetchMethod: PropTypes.func
  }

  static defaultProps = {method: 'get', fetchMethod: isomorphicFetch, onFetchingStateChange: _.identity}

  static isEqualWithFunc = _.partialRight(_.isEqualWith, (val1, val2) => {
    if (_.isFunction(val1) && _.isFunction(val2)) {
      return val1.toString() === val2.toString()
    }
  })

  state = {isFetching: false, response: null, data: null, error: null}

  componentDidMount() {
    if (!this.props.lazy) {
      this.fetch()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.lazy && !Fetch.isEqualWithFunc(this.props, nextProps)) {
      this.fetch()
    }
  }

  componentWillUnmount() {
    this.willUnmount = true
  }

  fetchCount = 0

  parseResponse(response) {
    let contentType = response.headers.get('content-type') || ''
    let isJsonResult = contentType.toLowerCase().indexOf('application/json') !== -1

    return isJsonResult ? response.json() : response.text()
  }

  fetch = (body = this.props.body) => {
    this.fetchCount += 1
    const fetchId = this.fetchCount
    const setState2 = (newState, callback) => {
      if (fetchId === this.fetchCount) {
        this.setState(newState, callback)
      }
    }

    return new Promise((resolve, reject) => {
      this.props.onFetchingStateChange(true)
      setState2({isFetching: true}, () => {
        let options = _.defaultsDeep({
          method: this.props.method,
          headers: this.props.headers,
          data: body
        }, this.props.params)
        this.props.fetchMethod(this.props.url, options).then(checkStatus).then(response => {
          return Promise.all([Promise.resolve(response), this.parseResponse(response)])
        }).then(([response, data]) => {
          this.props.onFetchingStateChange(false)
          if (this.willUnmount) {
            return
          }
          setState2({isFetching: false, response, data: data, error: null}, () => {
            if (this.props.onResponse) {
              this.props.onResponse(response)
            }
            if (this.props.onData) {
              this.props.onData(this.state.data)
            }
            resolve(this.state.data)
          })
        }).catch(error => {
          this.props.onFetchingStateChange(false)
          if (this.willUnmount) {
            return
          }
          if (!error.response) {
            throw new Error(
              `${error.message} on ${this.props.method.toUpperCase()} ${this.props.url}`
            )
          }
          this.parseResponse(error.response).then(res => {
            setState2({
              isFetching: false,
              response: error.response,
              error: res
            }, () => {
              if (this.props.onResponse) {
                this.props.onResponse(error.response)
              }
              if (this.props.onError) {
                this.props.onError(this.state.error)
              }
              reject(this.state.error)
            })
          })
        })
      })
    })
  }

  render() {
    return this.props.children({...this.state, fetch: this.fetch})
  }
}
