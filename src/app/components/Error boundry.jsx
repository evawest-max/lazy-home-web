import { Box } from "@chakra-ui/react";
import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <Box alignContent= "center">
        <h2>Something went wrong.</h2>;
        </Box>
    }
    return this.props.children;
  }
}