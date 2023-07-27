import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightCardComponent } from '../flight-card/flight-card.component';
import { CityPipe } from '@flight-demo/shared/ui-common';
import { Flight, FlightService } from '@flight-demo/tickets/domain';
import { debounceTime, timer } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css'],
  imports: [CommonModule, FormsModule, CityPipe, FlightCardComponent],
})
export class FlightSearchComponent {
  from = signal('London');
  to = signal('New York');
  flights: Array<Flight> = [];
  selectedFlight: Flight | undefined;
  flightRoute = computed(
    () => 'From ' + this.from() + ' to ' + this.to() + '.'
  );
  basket: Record<number, boolean> = {
    3: true,
    5: true,
  };
  timer$ = timer(0, 1_000);
  timer = toSignal(this.timer$, {
    initialValue: -1
    // requireSync: true
  });
  debouncedFrom$ = toObservable(this.from).pipe(
    debounceTime(300)
  );
  debouncedFrom = toSignal(this.debouncedFrom$, {
    initialValue: ''
  });

  private flightService = inject(FlightService);

  constructor() {
    this.from.set('Berlin');
    this.from.set('Paris');
    this.from.update(city => city + 'Rom');

    const numbers = signal([0]);
    numbers.mutate(numbers => numbers.push(1));

    setTimeout(() => this.from.set('Madrid'));

    effect(() => {
      console.log(this.from()/* , this.timer() */);
    });
  }


  search(): void {
    if (!this.from || !this.to) {
      return;
    }

    // Reset properties
    this.selectedFlight = undefined;

    this.flightService.find(this.from(), this.to()).subscribe({
      next: (flights) => {
        this.flights = flights;
      },
      error: (errResp) => {
        console.error('Error loading flights', errResp);
      },
    });
  }

  select(f: Flight): void {
    this.selectedFlight = { ...f };
  }
}
