"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbgoalyd";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

type SubmissionState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
};

const initialSubmissionState: SubmissionState = {
  status: "idle",
  message: "",
};

function validateForm(formData: FormData): FieldErrors {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const errors: FieldErrors = {};

  if (!name) {
    errors.name = "Enter your name.";
  }

  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!message) {
    errors.message = "Tell us a little about your project.";
  }

  return errors;
}

async function getFormspreeError(response: Response) {
  const fallback = "Your message could not be sent. Please try again.";

  try {
    const data = (await response.json()) as {
      errors?: Array<{ message?: string }>;
    };
    const message = data.errors?.find((error) => error.message)?.message;
    return message ?? fallback;
  } catch {
    return fallback;
  }
}

export function Contact() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>(initialSubmissionState);
  const submittingRef = useRef(false);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

    if (submission.status !== "submitting" && submission.status !== "idle") {
      setSubmission(initialSubmissionState);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmission({
        status: "error",
        message: "Check the highlighted fields and try again.",
      });
      const firstInvalidField = (["name", "email", "message"] as const).find(
        (field) => errors[field],
      );
      if (firstInvalidField) {
        form.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      }
      return;
    }

    (["name", "email", "message"] as const).forEach((field) => {
      formData.set(field, String(formData.get(field) ?? "").trim());
    });

    setFieldErrors({});
    setSubmission({ status: "submitting", message: "Sending your message…" });
    submittingRef.current = true;

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await getFormspreeError(response));
      }

      form.reset();
      setSubmission({
        status: "success",
        message: "Message sent. We’ll be in touch.",
      });
    } catch (error) {
      setSubmission({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Your message could not be sent. Please try again.",
      });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <Reveal>
        <p className="section-label">04 / Contact</p>
        <h2 id="contact-title">
          LET&apos;S MAKE
          <span>SOMETHING DIFFERENT.</span>
        </h2>
      </Reveal>

      <div className="contact-lower">
        <div className="contact-copy">
          <p>Have a project, an idea, or something harder to define?</p>
          <p>Real contact details are coming soon.</p>
        </div>

        <form
          className="contact-form"
          action={FORMSPREE_ENDPOINT}
          method="POST"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="contact-form-grid">
            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                onChange={() => clearFieldError("name")}
              />
              {fieldErrors.name ? (
                <span className="contact-field-error" id="contact-name-error">
                  {fieldErrors.name}
                </span>
              ) : null}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                onChange={() => clearFieldError("email")}
              />
              {fieldErrors.email ? (
                <span className="contact-field-error" id="contact-email-error">
                  {fieldErrors.email}
                </span>
              ) : null}
            </div>

            <div className="contact-field contact-field-message">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                onChange={() => clearFieldError("message")}
              />
              {fieldErrors.message ? (
                <span className="contact-field-error" id="contact-message-error">
                  {fieldErrors.message}
                </span>
              ) : null}
            </div>
          </div>

          <div className="contact-honeypot" aria-hidden="true">
            <label htmlFor="contact-company">Leave this field empty</label>
            <input
              id="contact-company"
              name="_gotcha"
              type="text"
              autoComplete="off"
              tabIndex={-1}
            />
          </div>

          <div className="contact-form-actions">
            <p
              className="contact-form-status"
              data-state={submission.status}
              role={submission.status === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {submission.message}
            </p>
            <button
              className="contact-submit"
              type="submit"
              disabled={submission.status === "submitting"}
            >
              <span>{submission.status === "submitting" ? "Sending…" : "Send inquiry"}</span>
              <ArrowUpRight />
            </button>
          </div>
        </form>
      </div>

      <footer className="site-footer">
        <a href="#top">OFFSET®</a>
        <p>Independent digital studio / Ireland</p>
        <p>© 2026 OFFSET®</p>
      </footer>
    </section>
  );
}
