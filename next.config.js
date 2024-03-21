/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  // patch the webpack config to ignore the cloudflare standard library
  // https://github.com/vercel/next.js/discussions/50177
  // webpack: (config, { webpack }) => {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //   config.plugins.push(
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //     new webpack.IgnorePlugin({
  //       resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
  //     }),
  //   );
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return config;
  // },
};

export default config;
