// Simulation Engine has been removed in favor of real ESP32 hardware integration.
export class SimulationEngine {
  constructor(_config?: any) {}
  public step() { return {} as any; }
  public setMode(_mode: any) {}
  public setManualSpeed(_spd: any) {}
  public setExhaustFan(_on: any) {}
  public triggerMoistureEvent() {}
  public toggleMotion() {}
  public adjustSimulatedTemperature(_delta: any) {}
  public updateConfig(_config: any) {}
}
