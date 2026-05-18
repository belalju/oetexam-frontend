import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTest } from './create-test';

describe('CreateTest', () => {
  let component: CreateTest;
  let fixture: ComponentFixture<CreateTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTest],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTest);
    component = fixture.componentInstance;

    fixture.detectChanges(); // triggers ngOnInit + form initialization
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onAudioSelected should set selectedFile and patch audioFileUrl with file.name', () => {
    const file = new File(['dummy-audio-bytes'], 'sample-audio.mp3', { type: 'audio/mpeg' });

    const event = {
      target: {
        files: [file],
      },
    };

    component.onAudioSelected(event);

    expect(component.selectedFile).toBe(file);

    const audioFileUrlControl = component.passageForm.get('audioFileUrl');
    expect(audioFileUrlControl).toBeTruthy();
    expect(audioFileUrlControl?.value).toBe('sample-audio.mp3');
  });
});
