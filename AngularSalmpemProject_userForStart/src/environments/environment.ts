// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// const host = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

const withoutporthost = location.protocol+'//'+location.hostname;

export const environment = {
  production: false,
  apiUrl: withoutporthost+':3070/api/v1/',
  ImageUrl: withoutporthost+':3070/assets/',
  samplefileurl : withoutporthost+":3070/v1/samplefile/",
  SOCKET_ENDPOINT: withoutporthost+":3070"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
