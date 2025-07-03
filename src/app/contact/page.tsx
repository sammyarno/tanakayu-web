'use client';

import { useMemo, useState } from 'react';

import AnnouncementCard from '@/components/AnnouncementCard';
import Breadcrumb from '@/components/Breadcrumb';
import CategoryFilter from '@/components/CategoryFilter';
import PageContent from '@/components/PageContent';
import { contacts } from '@/data/contacts';
import type { Contact } from '@/types';

const Contact = () => {
  const groupedContacts = contacts.reduce(
    (acc, contact) => {
      if (!acc[contact.category]) acc[contact.category] = [];
      acc[contact.category].push(contact);
      return acc;
    },
    {} as Record<'pengurus' | 'satpam', Contact[]>
  );

  return (
    <PageContent>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Tim & Kontak', link: '/our-team' },
        ]}
      />
      <section id="menu" className="flex flex-col gap-4">
        <h2 className="font-sans text-3xl font-bold uppercase">👥 Tim & Kontak</h2>
      </section>
      <section className="flex flex-col gap-4">
        {Object.entries(groupedContacts).map(([category, members]) => (
          <section key={category}>
            <h2 className="text-tanakayu-dark mb-4 text-xl font-semibold">
              {category === 'pengurus' ? 'Pengurus' : 'Satpam'}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {members.map(member => (
                <div
                  key={member.id}
                  className="border-tanakayu-accent flex flex-col items-center border bg-white p-3 text-center"
                >
                  <img src={member.image} alt={member.name} className="mb-3 size-36 rounded object-cover" />
                  <h2 className="text-tanaka-dark text-base font-semibold">{member.name}</h2>
                  <p className="mb-3 text-sm text-gray-600">{member.role}</p>
                  <a
                    href={`https://wa.me/${member.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-tanakayu-card w-full rounded"
                  >
                    <button className="w-full py-1 text-white"> Hubungi</button>
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>
    </PageContent>
  );
};

export default Contact;
