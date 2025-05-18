import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ConsumptionFormatPipe } from '../../shared/pipes/consumption-format.pipe';
import { FadeInDirective } from '../../shared/directives/fade-in.directive';
import { ConsumptionTrend } from '../../shared/services/consumption-analysis.service';
@Component({
  selector: 'app-consumption-trends',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    ConsumptionFormatPipe,
    FadeInDirective
  ],
  templateUrl: './consumption-trends.component.html',
  styleUrls: ['./consumption-trends.component.css']
})
export class ConsumptionTrendsComponent {
  @Input() consumptionTrends: ConsumptionTrend[] = [];
}
