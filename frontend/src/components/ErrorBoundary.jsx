import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#f6f8f7] p-6">
          <section className="max-w-xl rounded-lg border border-red-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase text-red-600">Frontend error</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">The app could not render.</h1>
            <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{this.state.error.message}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
