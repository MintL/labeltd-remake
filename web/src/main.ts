import './host/styles.css';
import './app.css';
import { ThreeHost, type HostEvent } from './host/threeHost';
import { parseFormSource } from './vb/formParser';
import { loadLegacyProject } from './vb/projectLoader';
import { setControlProperty, type ControlInstance } from './vb/controls';
import { VbVM } from './vb/vm';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

const status = document.createElement('p');
status.className = 'startup-status';
status.textContent = 'Loading original VB6 source…';
app.appendChild(status);
void run();

async function run(): Promise<void> {
  try {
    const project = await loadLegacyProject();
    const parsed = parseFormSource(project.formText);
    if (parsed.diagnostics.length) {
      throw new Error(parsed.diagnostics.map(item => `line ${item.line}: ${item.message}`).join('\n'));
    }
    const runtime = new VbVM({
      program: parsed.program,
      form: parsed.root,
      files: project.fileSystem,
      resolveResource: reference => project.frx.resolve(reference.offset),
      inputBox: (_message, _title, defaultValue) => defaultValue,
    });
    // The legacy header image contains a baked-in Menu label as well as the
    // cash display. Crop away only that label so the cash display survives.
    const menuHeader = runtime.controls.find('Image1');
    if (menuHeader && 'properties' in menuHeader) setControlProperty(menuHeader, '__cropLeft', 0.5);
    const menuButton = runtime.controls.find('Img_meny');
    if (menuButton && 'properties' in menuButton) setControlProperty(menuButton, 'Visible', false);
    const editorButton = runtime.controls.find('menuMapedit');
    if (editorButton && 'properties' in editorButton) setControlProperty(editorButton, 'Enabled', false);
    status.remove();
    const host = new ThreeHost(app!);
    host.setRoot(runtime.controls.root);
    const errorPanel = document.createElement('pre');
    errorPanel.className = 'runtime-error';
    errorPanel.hidden = true;
    app!.appendChild(errorPanel);

    const reportError = (error: unknown): void => {
      errorPanel.hidden = false;
      errorPanel.textContent = error instanceof Error ? error.message : String(error);
      console.error(error);
    };
    const eventName = (event: HostEvent): string => event.control === runtime.controls.root ? 'Form' : event.name;
    const absolutePoint = (event: HostEvent): [number, number] => {
      let x = event.x ?? 0;
      let y = event.y ?? 0;
      let control = event.control as ControlInstance | undefined;
      while (control && control !== runtime.controls.root) {
        x += Number(control.properties.Left ?? 0);
        y += Number(control.properties.Top ?? 0);
        control = control.parent;
      }
      return [x, y];
    };
    host.onEvent = (event) => {
      try {
        const name = eventName(event);
        if (event.event === 'KeyDown') {
          // The original form opens its menu on Pause, Escape, and F10.
          // This web version starts on the board and has no menu.
          if (![19, 27, 121].includes(event.keyCode ?? 0)) {
            runtime.dispatch('Form', 'KeyDown', undefined, [event.keyCode ?? 0, event.shift ?? 0]);
          }
        } else if (event.event === 'MouseMove') {
          const args = [event.button ?? 0, event.shift ?? 0, event.x ?? 0, event.y ?? 0];
          if (runtime.procedures.has(`${name}_MouseMove`.toLowerCase())) {
            runtime.dispatch(name, 'MouseMove', event.index, args);
          } else {
            const [x, y] = absolutePoint(event);
            runtime.dispatch('Form', 'MouseMove', undefined, [event.button ?? 0, event.shift ?? 0, x, y]);
          }
        } else if (event.event === 'Click') {
          runtime.dispatch(name, 'Click', event.index);
        }
        host.render();
      } catch (error) { reportError(error); }
    };

    runtime.start();
    // Invoke the original Average difficulty handler so the game board opens
    // directly, without inserting game rules into the browser host.
    runtime.dispatch('CmdLife10', 'Click', undefined);
    host.render();

    let last = performance.now();
    const frame = (now: number): void => {
      const elapsed = now - last;
      last = now;
      try {
        runtime.advance(elapsed);
        host.render();
      } catch (error) { reportError(error); return; }
      if (!runtime.isHalted) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  } catch (error) {
    status.className = 'startup-error';
    status.textContent = error instanceof Error ? error.message : String(error);
    console.error(error);
  }
}
