import React, { ComponentType }  from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";

/*
 * A simple HOC that provides facility for listening to container resizes.
 */
export default function WidthProvider(ComposedComponent) {
  return class WidthProvider extends React.Component {
    constructor(props) {
      super(props);
      this.mounted = false;
      this.inprogress = false;
      this.intervals = [];

    }
    static defaultProps = {
      measureBeforeMount: false
    };

    static propTypes = {
      // If true, will not render children until mounted. Useful for getting the exact width before
      // rendering, to prevent any unsightly resizing.
      measureBeforeMount: true
    };

    state = {
      width: 1280
    };

    componentDidMount() {
      this.mounted = true;

      window.addEventListener("resize", this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set `overflow: scroll` on your body.
      this.onWindowResize();

      this.intervals.push(setInterval(() => {
        this.onWindowResize();
      }, 1000));
    }

    componentWillUnmount() {
      this.intervals.forEach(i => clearInterval(i));
      this.mounted = false;
      window.removeEventListener("resize", this.onWindowResize);
    }

    onWindowResize = () => {
      if (!this.mounted || this.inprogress) return;

      this.inprogress = true;
      // eslint-disable-next-line react/no-find-dom-node
      const node = ReactDOM.findDOMNode(this);
      if (node instanceof HTMLElement && this.state.width !== node.offsetWidth) {
        this.setState({ width: node.offsetWidth });
      }
      this.inprogress = false;
    };

    render() {
      const { measureBeforeMount, ...rest } = this.props;
      if (measureBeforeMount && !this.mounted) {
        return (
          <div className={this.props.className} style={this.props.style} />
        );
      }

      return (<ComposedComponent {...rest} {...this.state} />);
    }
  };
}
