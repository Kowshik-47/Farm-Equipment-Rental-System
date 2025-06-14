import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
        <div class="animate-spin h-10">
            <h2 class="h-10">
                <div class="bg-black h-2 w-2 rounded-full"></div>
                <div class="bg-green h-2 w-2 rounded-full"></div>
            </h2>
        </div>
        <h1 class="loading animate-pulse">Loading ...</h1>
    </div>`,
  styles: [`
      .loading-container{
          display: flex;
          align-items: center;
          justify-content: center;
          margin: var(--space-2)
      }

      .loading{
        margin-left: 15px;
        margin-bottom: 0;
        font-weight: 400;
        font-size :1em;
      }

      .bg-green{
        background-color: var(--primary-light);
      }

      .animate-spin {
        display: inline-block;
        animation: spin 1.6s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
        display: inline-block;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: x-scale(1);
        }
        50% {
          opacity: 0.5;
          transform: x-scale(0.5);
        }
        100%{
          transform: x-scale(0);
        }
      }

      .h-10{
        height: .7em;
        margin:0;
      }

      br{
        margin:0;
      }
      .h-2{
        height: .3em;
        margin: .3em;
      }

      .w-2{
        width: .3em;
      }

      .rounded-full{
        border-radius: 50%;
      }
      .bg-black{
        background-color: black;
      }
    `]
})

export class LoaderComponent {
}
