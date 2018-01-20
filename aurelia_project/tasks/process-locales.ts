import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as project from '../aurelia.json';
import { build } from 'aurelia-cli';

export default function processLocales() {
  return gulp.src(project.localesProcessor.source)
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(build.bundle());
}
