import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Upload from '../src/pages/Upload';
import * as api from '../src/api';

vi.mock('../src/api');

describe('Upload Component', () => {
  it('renders upload form', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Step 1: Upload Resume/i)).toBeInTheDocument();
  });

  it('shows step 2 after successful upload', async () => {
    api.uploadResume = vi.fn().mockResolvedValue({
      data: { resume: { id: '123' } }
    });

    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/browse files/i, { selector: 'input' });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/Step 2: Job Description/i)).toBeInTheDocument();
    });
  });
});
