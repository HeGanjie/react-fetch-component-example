import React from "react";
import ReactDom from "react-dom";
import Fetch from './js/components/fetch.jsx'

class Main extends React.Component {
  state = { name: '' }

  render () {
    return (
      <div>
        <Fetch url={`/hello/${this.state.name}`} >
          {({isFetching, data, error}) => {
            return (
              <div>
                <div>{isFetching ? 'isFetching' : null}</div>
                <div>{data ? data : null}</div>
                <div>{error ? error : null}</div>
              </div>
            )
          }}
        </Fetch>
        <br/>
        <div>
          <input
            type="text"
            value={this.state.name}
            onChange={ev => this.setState({name: ev.target.value})}
          />
        </div>
      </div>
    )
  }
}

ReactDom.render(<Main />, document.querySelector('.app'));