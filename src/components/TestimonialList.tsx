import Image from 'next/image'

import type { PublicTestimonial } from '@/lib/publicTypes'

export function TestimonialList({ testimonials }: { testimonials: PublicTestimonial[] }) {
  return (
    <div className="testimonial-list">
      {testimonials.map((testimonial) => (
        <article className="testimonial-article" key={`${testimonial.clientName}-${testimonial.headline}`}>
          {testimonial.image && (
            <div className="testimonial-article__image">
              <Image
                alt={testimonial.image.alt}
                fill
                sizes="(max-width: 720px) 100vw, 36vw"
                src={testimonial.image.src}
              />
            </div>
          )}
          <div>
            <span>{testimonial.city}</span>
            {testimonial.headline && <h3>{testimonial.headline}</h3>}
            <p>{testimonial.quote}</p>
            <strong>{testimonial.clientName}</strong>
          </div>
        </article>
      ))}
    </div>
  )
}
