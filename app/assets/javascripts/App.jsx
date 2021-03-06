import { createClass } from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { Provider, connect } from 'react-redux';

/* Storeの実装 */

// 初期state変数（initialState）の作成
const initialState = {
  places: [],
  place: '',
  images: []
};
// Action名の定義
const ACTION_PLACES = 'PLACES';
const ACTION_PLACE = 'PLACE';
const ACTION_IMAGES = 'IMAGES';

// createStore（）メソッドを使ってStoreの作成
const store = applyMiddleware(ReduxThunk.default)(createStore)(reducer);
store.subscribe(() => console.log(store.getState()))

/* Actionの実装 */

// Action Creators
function places(value) {
  return {
    type: ACTION_PLACES,
    value
  };
}

function fetchPlaces() {
  return fetch("/places");
}

function getPlacesAsync() {
  return dispatch => {
    return fetchPlaces()
      .then(response => response.json())
      .then(json => dispatch(places(json)));
  };
}

function fetchPlace(id) {
  return fetch("/place/" + id);
}

function getPlaceAsync(id) {
  return dispatch => {
    return fetchPlace(id)
      .then(response => response.json())
      .then(json => dispatch(images(json)));
  }
}

function place(value) {
  // Action
  return {
    type: ACTION_PLACE,
    value,
  }
}

function images(value) {
  // Action
  return {
    type: ACTION_IMAGES,
    value
  }
}

// Reducer (複数可)
function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_PLACE:
      return Object.assign({}, state, {
        place: action.value,
      });
    case ACTION_PLACES:
      return Object.assign({}, state, {
        places: action.value,
      });
    case ACTION_IMAGES:
      return Object.assign({}, state, {
        images: action.value,
      });
    default:
      return state;
  }
}

// View (Container Components)
var HomeContainer = createClass({
  render: function() {
    return (
      <div>
        <DisplayImages data={this.props.images}/>
        <Places onLoad={this.props.onLoad} data={this.props.places} handleClick={this.props.onClick} place={this.props.place}/>
      </div>)
  }
});

// View (Presentational Components)
var Places = createClass({
  loadPlacesFromServer: function() {
    this.props.onLoad();
  },
  componentDidMount: function() {
    this.loadPlacesFromServer();
  },
  render: function() {
    var handleClick = this.props.handleClick;
    var placeNodes = this.props.data.map(function (places) {
      return (
        <Place id={places.id} placeName={places.placeName} onClickPlaceName={handleClick} key={places.id}/>
      );
    });
    return (
      <div className="menu">
        <ul className="placeList">
          {placeNodes}
        </ul>
      </div>
    );
  }
});

// View (Presentational Components)
var Place = createClass({
  handleClick: function(e) {
    e.preventDefault();
    this.props.onClickPlaceName(this.props.id);
    return;
  },
  render: function() {
    return (
      <li className="place">
        <a href="#" onClick={this.handleClick}>{this.props.placeName}</a>
      </li>
    );
  }
});

// View (Presentational Components)
var DisplayImages = createClass({
  render: function() {
    var imageNodes = this.props.data.map(function (images) {
      return (
        <Image key={images.url} url={images.url} mediumUrl={images.mediumUrl} small320url={images.small320url} title={images.title} description={images.description} license={images.license}/>
      );
    });
    return (
      <div className="main">
        <div className="items">
        {imageNodes}
        </div>
      </div>
    );
  }
});

var Image = createClass({
  render:function() {
    return (
      <section className="item">
        <a href={this.props.url} target="_blank">
          <img src={this.props.small320url}></img>
          <div className="title">{this.props.title}</div>
          <p className="description">{this.props.description}{this.props.license}</p>
        </a>
      </section>
    );
  }
})

// Connect to Redux
const mapStateToProps = (state) => {
  return {
    places: state.places,
    place: state.place,
    images: state.images
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (value) => {
      dispatch(getPlaceAsync(value));
    },
    onLoad: () => {
      dispatch(getPlacesAsync());
    }
  };
};

const TokyoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeContainer);

// Rendering
render(
  <Provider store={store}>
    <TokyoContainer />
  </Provider>,
  document.getElementById("content")
);
