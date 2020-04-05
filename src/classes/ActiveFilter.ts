import Timer = NodeJS.Timer;

type TFilter = {[key: string]: string};

class ActiveFilter<T> {
  private originalData: T[];
  private filteredData: T[];
  private timer: Timer | null = null;
  private debounceMs: number = 300;

  constructor(data: T[], debounceMs = 300) {
    this.originalData = data;
    this.filteredData = data;
    this.debounceMs = debounceMs;
  }

  public updateFilter(filter: TFilter, callback?: (rows: T[]) => void) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      if (this.timer) {
        clearTimeout(this.timer!);
        this.timer = null;
      }
      this.doFilter(filter);
      callback && callback(this.filteredData);
    }, this.debounceMs);
  }

  public get data() {
    return this.filteredData;
  }

  private doFilter(filter: TFilter) {
    const realFilters = Object.keys(filter).filter(name => filter[name] > '');
    const lexems = realFilters.map(name =>
      `(o.${name.toUpperCase()} || '').toLowerCase().indexOf("${filter[name].toLowerCase()}") >= 0`,
    );

    const filterMethod = realFilters.length > 0 ? eval(`o => ${lexems.join(' && ')}`) : () => true;
    this.filteredData = this.originalData.filter(filterMethod);
  }
}

export default ActiveFilter;
